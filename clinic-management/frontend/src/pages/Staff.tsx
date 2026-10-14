import { useEffect, useState } from 'react';
import type { UserDto } from '../types';
import { createUser, getUsers } from '../api/endpoints';
import { rupee } from '../utils';
import StatCard from '../components/StatCard';

const ROLES = ['Admin', 'Doctor', 'Receptionist', 'Nurse', 'Staff'];

const emptyForm = {
  name: '', username: '', password: '', role: 'Receptionist',
  consultationFee: '', specialization: '', phone: '',
};

export default function Staff() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [nu, setNu] = useState(emptyForm);

  const load = () => { getUsers().then(setUsers).catch(() => setUsers([])); };
  useEffect(load, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await createUser({
        ...nu,
        consultationFee: nu.consultationFee ? Number(nu.consultationFee) : null,
        specialization: nu.specialization || null,
        phone: nu.phone || null,
      });
      setNu(emptyForm);
      setMsg('Staff member added.');
      setTimeout(() => setMsg(''), 2500);
      load();
    } catch { setErr('Could not add staff (username may already exist).'); }
  };

  const doctors = users.filter((u) => u.role === 'Doctor').length;

  return (
    <div>
      <h1 className="page-title">Staff</h1>
      {msg && <div className="card" style={{ background: '#ecfdf5', marginBottom: 12 }}>{msg}</div>}

      <div className="grid cards" style={{ marginBottom: 16 }}>
        <StatCard label="Total Staff" value={users.length} />
        <StatCard label="Doctors" value={doctors} tone="green" />
        <StatCard label="Active" value={users.filter((u) => u.isActive).length} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="card">
          <h3>Team Members</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Specialization</th><th>Fee</th></tr></thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="muted">No staff yet.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.specialization || '-'}</td>
                  <td>{u.consultationFee ? rupee(u.consultationFee) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Add Staff</h3>
          {err && <div className="muted" style={{ color: 'var(--red)' }}>{err}</div>}
          <form onSubmit={addUser}>
            <div className="row">
              <div className="field"><label>Name</label>
                <input className="input" value={nu.name} required
                  onChange={(e) => setNu({ ...nu, name: e.target.value })} /></div>
              <div className="field"><label>Username</label>
                <input className="input" value={nu.username} required
                  onChange={(e) => setNu({ ...nu, username: e.target.value })} /></div>
            </div>
            <div className="row">
              <div className="field"><label>Password</label>
                <input className="input" type="password" value={nu.password} required
                  onChange={(e) => setNu({ ...nu, password: e.target.value })} /></div>
              <div className="field"><label>Role</label>
                <select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select></div>
            </div>
            <div className="field"><label>Phone</label>
              <input className="input" value={nu.phone}
                onChange={(e) => setNu({ ...nu, phone: e.target.value })} /></div>
            {nu.role === 'Doctor' && (
              <div className="row">
                <div className="field"><label>Consultation Fee (₹)</label>
                  <input className="input" type="number" value={nu.consultationFee}
                    onChange={(e) => setNu({ ...nu, consultationFee: e.target.value })} /></div>
                <div className="field"><label>Specialization</label>
                  <input className="input" value={nu.specialization}
                    onChange={(e) => setNu({ ...nu, specialization: e.target.value })} /></div>
              </div>
            )}
            <button className="btn btn-primary">Add Staff</button>
          </form>
        </div>
      </div>
    </div>
  );
}
