import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Patient } from '../types';
import { searchPatients } from '../api/endpoints';
import { formatDate } from '../utils';

export default function Patients() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [list, setList] = useState<Patient[]>([]);
  const navigate = useNavigate();

  useEffect(() => { setQ(params.get('q') ?? ''); }, [params]);

  useEffect(() => {
    const t = setTimeout(() => { searchPatients(q).then(setList).catch(() => setList([])); }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <h1 className="page-title">Patients</h1>
      <div className="toolbar">
        <input className="input" placeholder="Search by name, mobile or village/town/city…"
          value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 360 }} autoFocus />
        <button className="btn btn-primary" onClick={() => navigate('/add-patient')}>➕ Add Patient</button>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr>
            <th>Name</th><th>Age</th><th>Gender</th><th>Mobile</th>
            <th>Village/Town/City</th><th>Registered</th>
          </tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.id}`)}>
                <td><strong>{p.name}</strong></td>
                <td>{p.age}</td><td>{p.gender}</td><td>{p.mobileNumber || '-'}</td>
                <td>{p.villageTownCity}</td><td>{formatDate(p.createdAt)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
