import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function PatientLogin() {
  const { patientLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await patientLogin(mobileNumber.trim(), password);
      navigate('/portal');
    } catch {
      setError('Invalid mobile number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <div className="brand" style={{ marginBottom: 6 }}>Patient Login
          <small>Book appointments &amp; get reminders</small>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>Sign in with your mobile number</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Mobile number</label>
            <input className="input" value={mobileNumber} inputMode="numeric"
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="9876543210" autoFocus required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          New patient? <Link to="/portal/register">Create an account</Link>
        </p>
        <p className="muted" style={{ textAlign: 'center', marginTop: 4, fontSize: 14 }}>
          Clinic staff? <Link to="/login">Staff login</Link>
        </p>
        <p className="muted" style={{ textAlign: 'center', marginTop: 4, fontSize: 14 }}>
          Need a doctor? <Link to="/find">Find clinics near you</Link>
        </p>
      </div>
    </div>
  );
}
