import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isAxiosError } from 'axios';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clinicName: '', address: '', phone: '',
    adminName: '', username: '', password: '',
  });
  const [includeSampleData, setIncludeSampleData] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register({ ...form, includeSampleData });
      navigate('/');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409)
        setError(err.response.data?.message ?? 'Username already exists.');
      else setError('Could not create clinic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <div className="brand" style={{ marginBottom: 6 }}>Create your clinic
          <small>Register se digital clinic tak</small>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>Set up your clinic in under a minute</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Clinic / Hospital name</label>
            <input className="input" value={form.clinicName} onChange={set('clinicName')}
              placeholder="e.g. Sharma Clinic" autoFocus required />
          </div>
          <div className="field">
            <label>Clinic address</label>
            <input className="input" value={form.address} onChange={set('address')}
              placeholder="Main Road, Arrah, Bihar" required />
          </div>
          <div className="field">
            <label>Clinic phone (optional)</label>
            <input className="input" value={form.phone} onChange={set('phone')}
              placeholder="9876543210" />
          </div>
          <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '14px 0' }} />
          <div className="field">
            <label>Your name (Admin)</label>
            <input className="input" value={form.adminName} onChange={set('adminName')}
              placeholder="Dr. Sharma" required />
          </div>
          <div className="field">
            <label>Username</label>
            <input className="input" value={form.username} onChange={set('username')}
              placeholder="Choose a login username" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={form.password} onChange={set('password')}
              placeholder="At least 6 characters" required />
          </div>
          <label className="field" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexDirection: 'row', cursor: 'pointer' }}>
            <input type="checkbox" checked={includeSampleData}
              onChange={(e) => setIncludeSampleData(e.target.checked)}
              style={{ width: 'auto', marginTop: 3 }} />
            <span style={{ fontSize: 14 }}>
              Start with sample data
              <small className="muted" style={{ display: 'block' }}>
                Adds demo doctors, patients and recent visits so your dashboard and
                charts are populated. You can delete these anytime.
              </small>
            </span>
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Creating…' : 'Create Clinic & Continue'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
