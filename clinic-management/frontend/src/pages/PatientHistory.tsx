import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PatientHistory as History } from '../types';
import { getPatientHistory } from '../api/endpoints';
import { formatDate, paymentBadge, paymentLabel, rupee, visitLabel } from '../utils';
import StatCard from '../components/StatCard';

export default function PatientHistory() {
  const { id } = useParams();
  const [h, setH] = useState<History | null>(null);

  useEffect(() => { if (id) getPatientHistory(id).then(setH).catch(() => setH(null)); }, [id]);

  if (!h) return <p className="muted">Loading patient…</p>;
  const p = h.patient;

  return (
    <div>
      <h1 className="page-title">{p.name}</h1>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row">
          <div><span className="muted">Age</span><div><strong>{p.age}</strong></div></div>
          <div><span className="muted">Gender</span><div><strong>{p.gender}</strong></div></div>
          <div><span className="muted">Mobile</span><div><strong>{p.mobileNumber || '-'}</strong></div></div>
          <div><span className="muted">Village/Town/City</span><div><strong>{p.villageTownCity}</strong></div></div>
        </div>
      </div>

      <div className="grid cards" style={{ marginBottom: 16 }}>
        <StatCard label="Total Visits" value={h.visitCount} />
        <StatCard label="Last Visit" value={formatDate(h.lastVisitDate)} />
        <StatCard label="Total Paid" value={rupee(h.totalPaid)} tone="green" />
        <StatCard label="Pending" value={rupee(h.totalPending)} tone="amber" />
      </div>

      <h3>Visit History</h3>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr>
            <th>Date</th><th>Doctor</th><th>Visit Type</th><th>Fee</th><th>Payment</th><th>Notes</th>
          </tr></thead>
          <tbody>
            {h.visits.map((v) => (
              <tr key={v.id}>
                <td>{formatDate(v.visitDate)}</td>
                <td>{v.doctorName}</td>
                <td>{visitLabel(v.visitType)}</td>
                <td>{rupee(v.consultationFee)}</td>
                <td><span className={`badge ${paymentBadge(v.paymentStatus)}`}>{paymentLabel(v.paymentStatus)}</span></td>
                <td className="muted">{v.notes || '-'}</td>
              </tr>
            ))}
            {h.visits.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                No visits yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
