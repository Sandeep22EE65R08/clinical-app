import { useEffect, useState } from 'react';
import { portalGetVisits } from '../../api/endpoints';
import type { PortalVisit } from '../../types';
import { formatDate, formatTime, paymentBadge, paymentLabel, rupee, visitLabel } from '../../utils';

export default function PortalVisits() {
  const [items, setItems] = useState<PortalVisit[]>([]);

  useEffect(() => {
    portalGetVisits().then(setItems).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title">My visits</h1>

      {items.length === 0 && (
        <div className="card muted">No visits recorded yet.</div>
      )}

      {items.map((v) => {
        const due = Math.max(0, v.consultationFee - v.amountPaid);
        return (
          <div className="card portal-appt" key={v.id}>
            <div className="li-body">
              <b>{formatDate(v.visitDate)} at {formatTime(v.visitTime)}</b>
              <small>Dr. {v.doctorName} · {visitLabel(v.visitType)}</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><b>{rupee(v.consultationFee)}</b></div>
              {due > 0 && <small className="muted">{rupee(due)} due</small>}
            </div>
            <span className={`badge ${paymentBadge(v.paymentStatus)}`}>
              {paymentLabel(v.paymentStatus)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
