import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('reception');
  const [password, setPassword] = useState('reception123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      navigate(res.role === 'Patient' ? '/portal' : '/');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <div className="brand" style={{ marginBottom: 6 }}>Clinic Register
          <small>Register se digital clinic tak</small>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>Sign in to continue</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          New clinic? <Link to="/register">Create your clinic</Link>
        </p>
        <p className="muted" style={{ textAlign: 'center', marginTop: 4, fontSize: 14 }}>
          Are you a patient? <Link to="/portal/login">Patient login</Link>
        </p>
        <div className="card" style={{ marginTop: 16, background: '#f8fafc' }}>
          <div className="muted" style={{ fontSize: 13 }}>
            <strong>Demo logins</strong><br />
            admin / admin123<br />
            sharma / doctor123 (doctor)<br />
            reception / reception123
          </div>
        </div>
      </div>
    </div>
  );
}
