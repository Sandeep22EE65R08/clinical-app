import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../auth/AuthContext';
import { getPublicClinics } from '../api/endpoints';
import type { PublicClinic } from '../types';

export default function PatientRegister() {
  const { patientRegister } = useAuth();
  const navigate = useNavigate();
  // Coming from "Find care": preselect the chosen clinic and remember the doctor for booking.
  const [params] = useSearchParams();
  const wantedClinic = params.get('clinic');
  const wantedDoctor = params.get('doctor');
  const [clinics, setClinics] = useState<PublicClinic[]>([]);
  const [form, setForm] = useState({
    clinicId: '', name: '', mobileNumber: '', password: '',
    age: '', gender: 'Male', villageTownCity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPublicClinics()
      .then((list) => {
        setClinics(list);
        const chosen = list.find((c) => c.id === wantedClinic) ?? list[0];
        if (chosen) setForm((f) => ({ ...f, clinicId: chosen.id }));
      })
      .catch(() => setError('Could not load clinics. Please try again later.'));
  }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.clinicId) { setError('Please select your clinic.'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    setLoading(true);
    try {
      await patientRegister({
        clinicId: form.clinicId,
        name: form.name.trim(),
        mobileNumber: form.mobileNumber.trim(),
        password: form.password,
        age: Number(form.age) || 0,
        gender: form.gender,
        villageTownCity: form.villageTownCity.trim(),
      });
      navigate(wantedClinic ? `/portal/book${wantedDoctor ? `?doctor=${wantedDoctor}` : ''}` : '/portal');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409)
        setError(err.response.data?.message ?? 'This mobile number is already registered.');
      else if (isAxiosError(err) && err.response?.data?.message)
        setError(err.response.data.message);
      else setError('Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <div className="brand" style={{ marginBottom: 6 }}>Patient Sign Up
          <small>Book appointments &amp; get reminders</small>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>Create your patient account</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Your clinic</label>
            <select className="input" value={form.clinicId} onChange={set('clinicId')} required>
              <option value="" disabled>Select a clinic</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.address}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Full name</label>
            <input className="input" value={form.name} onChange={set('name')}
              placeholder="Ramesh Kumar" required />
          </div>
          <div className="field">
            <label>Mobile number</label>
            <input className="input" value={form.mobileNumber} inputMode="numeric"
              onChange={set('mobileNumber')} placeholder="9876543210" required />
          </div>
          <div className="row">
            <div className="field">
              <label>Age</label>
              <input className="input" type="number" min={0} value={form.age}
                onChange={set('age')} placeholder="30" />
            </div>
            <div className="field">
              <label>Gender</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Village / Town / City</label>
            <input className="input" value={form.villageTownCity} onChange={set('villageTownCity')}
              placeholder="Rampur" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={form.password} onChange={set('password')}
              placeholder="At least 4 characters" required />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          Already registered? <Link to="/portal/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
