import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalGetNotifications } from '../../api/endpoints';
import type { Notification } from '../../types';
import { formatDate } from '../../utils';

export default function PortalNotifications() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    portalGetNotifications().then((r) => setItems(r.items)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title">Notifications</h1>

      {items.length === 0 && (
        <div className="card muted">You're all caught up — no notifications.</div>
      )}

      {items.map((n, i) => {
        const body = (
          <div className="card portal-alert">
            <span className={`alert-dot ${n.severity}`} />
            <div className="li-body">
              <b>{n.title}</b>
              <small>{n.message}</small>
              <small className="muted">{formatDate(n.createdAt)}</small>
            </div>
          </div>
        );
        return n.link
          ? <Link key={i} to={n.link} style={{ textDecoration: 'none', color: 'inherit' }}>{body}</Link>
          : <div key={i}>{body}</div>;
      })}
    </div>
  );
}
