import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalCancelAppointment, portalGetAppointments } from '../../api/endpoints';
import type { Appointment } from '../../types';
import { apptStatusLabel, formatDate, formatTime } from '../../utils';

export default function PortalAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => portalGetAppointments().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    setBusy(id);
    try {
      await portalCancelAppointment(id);
      await load();
    } finally {
      setBusy(null);
    }
  };

  const canCancel = (s: Appointment['status']) =>
    s === 'Scheduled' || s === 'Waiting';

  return (
    <div>
      <div className="section-head">
        <h1 className="page-title" style={{ margin: 0 }}>My appointments</h1>
        <Link to="/portal/book" className="btn btn-primary">Book new</Link>
      </div>

      {items.length === 0 && (
        <div className="card muted">You have no appointments yet.</div>
      )}

      {items.map((a) => (
        <div className="card portal-appt" key={a.id}>
          <div className="li-body">
            <b>{formatDate(a.scheduledDate)} at {formatTime(a.scheduledTime)}</b>
            <small>Dr. {a.doctorName}{a.reason ? ` · ${a.reason}` : ''}</small>
          </div>
          <span className={`status-pill ${a.status.toLowerCase()}`}>
            {apptStatusLabel(a.status)}
          </span>
          {canCancel(a.status) && (
            <button className="btn btn-ghost" disabled={busy === a.id}
              onClick={() => cancel(a.id)}>
              {busy === a.id ? '…' : 'Cancel'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
