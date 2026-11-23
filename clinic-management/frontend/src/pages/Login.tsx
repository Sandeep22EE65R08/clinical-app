import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  IconCalendar, IconChart, IconEye, IconLock, IconPatients, IconSignIn, IconUser, LogoMark,
} from '../components/LoginIcons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password, remember);
      navigate(res.role === 'Patient' ? '/portal' : '/');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-split">
        <aside className="login-hero">
          <img className="login-photo" src="/login-doctor.jpg" alt="" aria-hidden="true" />
          <div className="login-hero-content">
            <div className="login-logo">
              <LogoMark />
              <div><b>Clinic Management</b><small>Smart Care • Better Health</small></div>
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to access your clinic dashboard and manage patient records.</p>
            <ul className="login-points">
              <li><span><IconPatients /></span>Manage Patients<br />Easily</li>
              <li><span><IconCalendar /></span>Track Visits &amp; Fees</li>
              <li><span><IconChart /></span>View Reports<br />and Insights</li>
            </ul>
          </div>
          <div className="login-wave">
            <svg width="70" height="22" viewBox="0 0 70 22" aria-hidden="true">
              <path d="M0 12h18l5-9 7 18 6-13 4 4h30" fill="none" stroke="#fff" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </svg>
            Your Health, Our Priority
          </div>
        </aside>

        <section className="login-form-side">
          <h1>Clinic Register</h1>
          <p className="sub">Sign in to continue</p>
          <form onSubmit={submit}>
            <div className="login-field">
              <span className="ico"><IconUser /></span>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username" autoComplete="username" autoFocus required />
            </div>
            <div className="login-field">
              <span className="ico"><IconLock /></span>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" autoComplete="current-password" required />
              <button type="button" className="login-eye" onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}><IconEye off={showPw} /></button>
            </div>
            <label className="login-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember Me
            </label>
            {error && <div className="error">{error}</div>}
            <button className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : <><IconSignIn /> Sign In</>}
            </button>
          </form>
          <div className="login-links">
            New clinic? <Link to="/register">Create your clinic</Link><br />
            Are you a patient? <Link to="/portal/login">Patient login</Link><br />
            Looking for a doctor? <Link to="/find">Find clinics near you</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
