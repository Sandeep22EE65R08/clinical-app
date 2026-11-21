import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Patient, UserDto } from '../types';
import {
  createVisit, findExisting, getClinic, getDoctors, quickRegister, searchPatients,
} from '../api/endpoints';
import { parseVoiceEntry } from '../utils';

// Minimal typing for the browser Web Speech API (not in lib.dom).
interface SpeechRec {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void;
}
type SpeechRecCtor = new () => SpeechRec;
const getSpeechCtor = (): SpeechRecCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export default function AddPatient() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<UserDto[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const [heard, setHeard] = useState('');
  const voiceSupported = !!getSpeechCtor();
  const [existing, setExisting] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [f, setF] = useState({
    name: '', mobileNumber: '', age: '', gender: 'Male', villageTownCity: '',
    doctorId: '', visitType: 'NewConsultation', consultationFee: '500',
    paymentStatus: 'Paid', paymentMethod: 'Cash',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    getDoctors().then(setDoctors).catch(() => {});
    getClinic().then((c) => set('consultationFee', String(c.defaultConsultationFee))).catch(() => {});
    // Suggest villages/towns already used by this clinic's patients (autocomplete).
    searchPatients().then((list) => {
      const counts = new Map<string, number>();
      list.forEach((p) => p.villageTownCity &&
        counts.set(p.villageTownCity, (counts.get(p.villageTownCity) ?? 0) + 1));
      setVillages([...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v));
    }).catch(() => {});
  }, []);

  const startVoice = () => {
    const Ctor = getSpeechCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = voiceLang; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setHeard(text);
      const v = parseVoiceEntry(text);
      setExisting(null);
      setF((p) => ({
        ...p,
        name: v.name ?? p.name, age: v.age ?? p.age, mobileNumber: v.mobileNumber ?? p.mobileNumber,
        gender: v.gender ?? p.gender, villageTownCity: v.villageTownCity ?? p.villageTownCity,
        consultationFee: v.consultationFee ?? p.consultationFee,
      }));
    };
    rec.onerror = () => { setListening(false); setError('Could not hear clearly. Please try again or type.'); };
    rec.onend = () => setListening(false);
    setError(''); setListening(true);
    rec.start();
  };

  const checkExisting = async () => {
    if (!f.mobileNumber && !f.name) return;
    const p = await findExisting(f.mobileNumber, f.name, f.age ? Number(f.age) : undefined);
    if (p) {
      setExisting(p);
      setF((prev) => ({ ...prev, name: p.name, mobileNumber: p.mobileNumber ?? '',
        age: String(p.age), gender: p.gender, villageTownCity: p.villageTownCity }));
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    const fee = Number(f.consultationFee) || 0;
    const paid = f.paymentStatus === 'Paid' ? fee : f.paymentStatus === 'Pending' ? 0 : fee / 2;
    const visitCore = {
      doctorId: f.doctorId || null, visitType: f.visitType, consultationFee: fee,
      amountPaid: paid, paymentStatus: f.paymentStatus, paymentMethod: f.paymentMethod,
    };
    try {
      let visitId: string;
      if (existing) {
        const v = await createVisit({ patientId: existing.id, ...visitCore, notes: null });
        visitId = v.id;
      } else {
        const res = await quickRegister({
          patient: { name: f.name, mobileNumber: f.mobileNumber || null,
            age: Number(f.age) || 0, gender: f.gender, villageTownCity: f.villageTownCity },
          ...visitCore,
        });
        visitId = res.visit.id;
      }
      navigate(`/receipt/${visitId}`);
    } catch {
      setError('Could not save. Please check the details and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Add Patient</h1>
      {existing && (
        <div className="card" style={{ background: '#ecfdf5', marginBottom: 14 }}>
          Existing patient found — <strong>{existing.name}</strong>, {existing.villageTownCity}. A new visit
          will be added to their history.{' '}
          <button className="btn" type="button" onClick={() => setExisting(null)}>New patient instead</button>
        </div>
      )}
      <form onSubmit={save} className="card" style={{ maxWidth: 640 }}>
        {voiceSupported && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={startVoice} disabled={listening}>
              {listening ? '🎙 Listening…' : '🎤 Speak patient details'}
            </button>
            <select value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)} style={{ width: 'auto' }}>
              <option value="en-IN">English</option>
              <option value="hi-IN">हिन्दी / Hinglish</option>
            </select>
            {heard && <span className="muted" style={{ fontSize: 13 }}>Heard: “{heard}” — please review below</span>}
          </div>
        )}
        <div className="row">
          <div className="field"><label>Patient Name *</label>
            <input className="input" value={f.name} required autoFocus
              onChange={(e) => set('name', e.target.value)} onBlur={checkExisting} /></div>
          <div className="field"><label>Mobile Number</label>
            <input className="input" value={f.mobileNumber} inputMode="numeric"
              onChange={(e) => set('mobileNumber', e.target.value)} onBlur={checkExisting} /></div>
        </div>
        <div className="row">
          <div className="field"><label>Age</label>
            <input className="input" value={f.age} inputMode="numeric"
              onChange={(e) => set('age', e.target.value)} /></div>
          <div className="field"><label>Gender</label>
            <select value={f.gender} onChange={(e) => set('gender', e.target.value)}>
              <option>Male</option><option>Female</option><option>Other</option></select></div>
        </div>
        <div className="field"><label>Village / Town / City *</label>
          <input className="input" value={f.villageTownCity} required placeholder="e.g. Rampur"
            list="village-suggestions" autoComplete="off"
            onChange={(e) => set('villageTownCity', e.target.value)} />
          <datalist id="village-suggestions">
            {villages.map((v) => <option key={v} value={v} />)}
          </datalist></div>
        <div className="row">
          <div className="field"><label>Doctor</label>
            <select value={f.doctorId} onChange={(e) => set('doctorId', e.target.value)}>
              <option value="">Auto</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="field"><label>Visit Type</label>
            <select value={f.visitType} onChange={(e) => set('visitType', e.target.value)}>
              <option value="NewConsultation">New Consultation</option>
              <option value="FollowUp">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option></select></div>
        </div>
        <div className="row">
          <div className="field"><label>Consultation Fee (₹)</label>
            <input className="input" value={f.consultationFee} inputMode="numeric"
              onChange={(e) => set('consultationFee', e.target.value)} /></div>
          <div className="field"><label>Payment Status</label>
            <select value={f.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)}>
              <option>Paid</option><option>Pending</option>
              <option value="PartiallyPaid">Partially Paid</option></select></div>
          <div className="field"><label>Payment Method</label>
            <select value={f.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
              <option>Cash</option><option value="Upi">UPI</option>
              <option>Card</option><option>Other</option></select></div>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary btn-lg btn-block" disabled={saving}>
          {saving ? 'Saving…' : 'Save Patient & Generate Token'}
        </button>
      </form>
    </div>
  );
}
