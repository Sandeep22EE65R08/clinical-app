import { useEffect, useState } from 'react';
import type { QueueState, UserDto } from '../types';
import {
  callNext, completeQueue, getDoctors, getQueue, requeueQueue, skipQueue,
} from '../api/endpoints';

export default function Queue() {
  const [state, setState] = useState<QueueState | null>(null);
  const [doctors, setDoctors] = useState<UserDto[]>([]);
  const [doctorId, setDoctorId] = useState('');

  const load = () => getQueue(doctorId || undefined).then(setState).catch(() => setState(null));

  useEffect(() => { getDoctors().then(setDoctors).catch(() => {}); }, []);
  useEffect(() => { load(); }, [doctorId]);

  const act = (fn: Promise<QueueState>) => fn.then(setState).catch(() => {});
  const d = doctorId || undefined;

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Token Queue</h1>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          <option value="">All Doctors</option>
          {doctors.map((doc) => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
        </select>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
        <div className="muted">Now Serving</div>
        {state?.nowServing ? (
          <>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)' }}>
              #{state.nowServing.tokenNumber}
            </div>
            <div><strong>{state.nowServing.patientName}</strong> · {state.nowServing.villageTownCity}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => act(completeQueue(state.nowServing!.visitId, d))}>
                Complete Consultation</button>
              <button className="btn" onClick={() => act(requeueQueue(state.nowServing!.visitId, d))}>
                Move Back to Queue</button>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--muted)' }}>—</div>
        )}
        <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }}
          onClick={() => act(callNext(d))}>▶ Call Next Patient</button>
      </div>

      <h3>Waiting ({state?.waitingCount ?? 0})</h3>
      <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: 16 }}>
        <table className="table">
          <thead><tr><th>Token</th><th>Name</th><th>Village/Town/City</th><th>Doctor</th><th></th></tr></thead>
          <tbody>
            {state?.waiting.map((e) => (
              <tr key={e.visitId}>
                <td><span className="token">#{e.tokenNumber}</span></td>
                <td><strong>{e.patientName}</strong>
                  {e.visitStatus === 'Skipped' && <span className="badge partial" style={{ marginLeft: 8 }}>Skipped</span>}
                </td>
                <td>{e.villageTownCity}</td>
                <td>{e.doctorName}</td>
                <td>
                  <button className="btn" onClick={() => act(skipQueue(e.visitId, d))}>Skip</button>{' '}
                  <button className="btn" onClick={() => act(completeQueue(e.visitId, d))}>Complete</button>
                </td>
              </tr>
            ))}
            {(!state || state.waiting.length === 0) && (
              <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                No one waiting.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3>Completed ({state?.completed.length ?? 0})</h3>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Token</th><th>Name</th><th>Doctor</th><th></th></tr></thead>
          <tbody>
            {state?.completed.map((e) => (
              <tr key={e.visitId}>
                <td><span className="token">#{e.tokenNumber}</span></td>
                <td>{e.patientName}</td>
                <td>{e.doctorName}</td>
                <td><button className="btn" onClick={() => act(requeueQueue(e.visitId, d))}>Requeue</button></td>
              </tr>
            ))}
            {(!state || state.completed.length === 0) && (
              <tr><td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                None completed yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
