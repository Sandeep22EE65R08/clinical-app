import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Patient, UserDto } from '../types';
import {
  createVisit, findExisting, getClinic, getDoctors, quickRegister,
} from '../api/endpoints';

export default function AddPatient() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<UserDto[]>([]);
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
  }, []);

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
            onChange={(e) => set('villageTownCity', e.target.value)} /></div>
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
