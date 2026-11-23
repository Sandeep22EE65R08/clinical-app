import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DiscoverResult, Symptom } from '../types';
import { discoverCare, getSymptoms } from '../api/endpoints';
import { rupee } from '../utils';

// Public page (no login): pick symptoms + place -> suggested department -> nearby clinics.
export default function FindCare() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [hindi, setHindi] = useState(false);
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getSymptoms().then(setSymptoms).catch(() => {}); }, []);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(''); setLoading(true);
    try {
      setResult(await discoverCare({ symptoms: picked.join(','), text: text.trim(), location: location.trim() }));
    } catch { setError('Could not search right now. Please try again.'); }
    finally { setLoading(false); }
  };

  const bookLink = (clinicId: string, doctorId?: string) =>
    `/portal/register?clinic=${clinicId}${doctorId ? `&doctor=${doctorId}` : ''}`;

  return (
    <div className="find-wrap">
      <div className="find-head">
        <div>
          <h1>{hindi ? 'सही डॉक्टर खोजें' : 'Find the right doctor'}</h1>
          <p className="muted">{hindi ? 'अपनी समस्या चुनें और पास के क्लिनिक देखें।' : 'Choose your problem and see clinics near you.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="btn" onClick={() => setHindi((h) => !h)}>{hindi ? 'English' : 'हिन्दी'}</button>
          <Link className="btn" to="/login">Staff login</Link>
        </div>
      </div>

      <form className="card" onSubmit={search}>
        <h3 style={{ marginTop: 0 }}>{hindi ? 'आपको क्या परेशानी है?' : 'What problem are you facing?'}</h3>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
          {hindi ? 'यह निदान नहीं है। यह सिर्फ सही डॉक्टर चुनने में मदद करता है।'
            : 'This is not a diagnosis. It only helps you choose the right type of doctor.'}
        </p>
        <div className="chip-row">
          {symptoms.map((s) => (
            <button type="button" key={s.id} onClick={() => toggle(s.id)}
              className={`chip${picked.includes(s.id) ? ' chip-on' : ''}`}>
              {hindi ? s.labelHi : s.label}
            </button>
          ))}
        </div>
        <div className="field">
          <label>{hindi ? 'या अपनी समस्या लिखें (हिन्दी / English)' : 'Or describe it (Hindi / English)'}</label>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={hindi ? 'जैसे: दो दिन से बुखार और खांसी' : 'e.g. fever and cough for two days'} />
        </div>
        <div className="field">
          <label>{hindi ? 'आपका गाँव / शहर' : 'Your Village / Town / City'}</label>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Rampur, Arrah, Patna…" />
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Searching…' : (hindi ? 'पास के क्लिनिक और डॉक्टर खोजें' : 'Find nearby clinics and doctors')}
        </button>
        {error && <div className="error">{error}</div>}
      </form>

      {result?.triage.isEmergency && (
        <div className="find-emergency" role="alert">
          <b>{hindi ? '⚠ यह आपातकाल हो सकता है' : '⚠ This may be an emergency'}</b>
          <div>{result.triage.emergencyMessage} <a href="tel:112"><b>Call 112</b></a></div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          {result.triage.departments.length > 0 && (
            <p>{hindi ? 'सुझाया गया विभाग: ' : 'Suggested department: '}
              <b>{result.triage.departments.map((d) => d.department).join(', ')}</b>
              <span className="muted"> — {result.triage.disclaimer}</span></p>
          )}
          {result.clinics.length === 0 && (
            <div className="card muted">
              {hindi ? 'कोई क्लिनिक नहीं मिला। दूसरा शहर या कम लक्षण आज़माएँ।'
                : 'No clinics found. Try a nearby town or fewer symptoms.'}
            </div>
          )}
          {result.clinics.map((c) => (
            <div className="card find-clinic" key={c.id}>
              <div className="find-clinic-top">
                <div>
                  <b style={{ fontSize: 17 }}>{c.name}</b>
                  <div className="muted">📍 {c.address}</div>
                  {c.workingHours && <div className="muted">🕒 {c.workingHours}</div>}
                  {c.phone && <div><a href={`tel:${c.phone}`}>📞 {c.phone}</a></div>}
                </div>
                <Link className="btn btn-primary" to={bookLink(c.id)}>
                  {hindi ? 'अपॉइंटमेंट बुक करें' : 'Book appointment'}
                </Link>
              </div>
              {c.doctors.map((d) => (
                <div className="find-doc" key={d.id}>
                  <span><b>{d.name}</b>{d.specialization && <span className="muted"> · {d.specialization}</span>}</span>
                  <span>
                    {rupee(d.consultationFee ?? c.defaultConsultationFee)}{' '}
                    <Link to={bookLink(c.id, d.id)}>{hindi ? 'बुक करें' : 'Book'}</Link>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <p className="muted" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
        Are you a clinic? <Link to="/register">Create your clinic</Link> · Already a patient? <Link to="/portal/login">Patient login</Link>
      </p>
    </div>
  );
}
