import { useEffect, useState } from 'react';
import type { Clinic, UserDto } from '../types';
import { createUser, getClinic, getUsers, updateClinic } from '../api/endpoints';

export default function Settings() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [msg, setMsg] = useState('');
  const [nu, setNu] = useState({ name: '', username: '', password: '', role: 'Receptionist',
    consultationFee: '', specialization: '' });

  const load = () => {
    getClinic().then(setClinic).catch(() => {});
    getUsers().then(setUsers).catch(() => {});
  };
  useEffect(load, []);

  const saveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic) return;
    await updateClinic({ name: clinic.name, address: clinic.address, phone: clinic.phone,
      defaultConsultationFee: clinic.defaultConsultationFee, workingHours: clinic.workingHours,
      isListedPublicly: clinic.isListedPublicly });
    setMsg('Clinic settings saved.');
    setTimeout(() => setMsg(''), 2500);
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ ...nu, consultationFee: nu.consultationFee ? Number(nu.consultationFee) : null,
        specialization: nu.specialization || null, phone: null });
      setNu({ name: '', username: '', password: '', role: 'Receptionist', consultationFee: '', specialization: '' });
      load();
    } catch { setMsg('Could not add staff (username may exist).'); }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      {msg && <div className="card" style={{ background: '#ecfdf5', marginBottom: 12 }}>{msg}</div>}

      {clinic && (
        <form onSubmit={saveClinic} className="card" style={{ maxWidth: 640, marginBottom: 20 }}>
          <h3>Clinic Profile</h3>
          <div className="field"><label>Clinic Name</label>
            <input className="input" value={clinic.name}
              onChange={(e) => setClinic({ ...clinic, name: e.target.value })} /></div>
          <div className="field"><label>Address</label>
            <input className="input" value={clinic.address}
              onChange={(e) => setClinic({ ...clinic, address: e.target.value })} /></div>
          <div className="row">
            <div className="field"><label>Phone</label>
              <input className="input" value={clinic.phone ?? ''}
                onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} /></div>
            <div className="field"><label>Default Consultation Fee (₹)</label>
              <input className="input" value={clinic.defaultConsultationFee}
                onChange={(e) => setClinic({ ...clinic, defaultConsultationFee: Number(e.target.value) || 0 })} /></div>
          </div>
          <div className="field"><label>Working Hours</label>
            <input className="input" value={clinic.workingHours ?? ''}
              onChange={(e) => setClinic({ ...clinic, workingHours: e.target.value })} /></div>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '4px 0 14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={clinic.isListedPublicly} style={{ width: 'auto', marginTop: 3 }}
              onChange={(e) => setClinic({ ...clinic, isListedPublicly: e.target.checked })} />
            <span>
              Show my clinic in the public “Find a doctor” search
              <small className="muted" style={{ display: 'block' }}>
                Patients can find your clinic name, address, phone, doctors and fees. No patient
                data is ever shown.
              </small>
            </span>
          </label>
          <button className="btn btn-primary">Save Clinic Settings</button>
        </form>
      )}

      <div className="card" style={{ maxWidth: 900 }}>
        <h3>Staff Management</h3>
        <table className="table" style={{ marginBottom: 16 }}>
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Specialization</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}><td>{u.name}</td><td>{u.username}</td><td>{u.role}</td>
                <td>{u.specialization || '-'}</td></tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={addUser}>
          <h4>Add Staff</h4>
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
                <option>Admin</option><option>Doctor</option>
                <option>Receptionist</option><option>Nurse</option><option>Staff</option></select></div>
          </div>
          {nu.role === 'Doctor' && (
            <div className="row">
              <div className="field"><label>Consultation Fee</label>
                <input className="input" value={nu.consultationFee}
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
  );
}
