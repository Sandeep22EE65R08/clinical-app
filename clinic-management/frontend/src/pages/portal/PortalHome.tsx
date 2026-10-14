import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portalGetNotifications, portalGetProfile } from '../../api/endpoints';
import type { Notification, PortalProfile } from '../../types';

export default function PortalHome() {
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    portalGetProfile().then(setProfile).catch(() => {});
    portalGetNotifications().then((r) => setItems(r.items)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title">Hello{profile ? `, ${profile.name.split(' ')[0]}` : ''} 👋</h1>

      <div className="card">
        <div className="portal-hero">
          <div>
            <b>{profile?.clinicName ?? 'Your clinic'}</b>
            {profile?.clinicAddress && <div className="muted">{profile.clinicAddress}</div>}
            {profile?.clinicPhone && <div className="muted">📞 {profile.clinicPhone}</div>}
          </div>
          <Link to="/portal/book" className="btn btn-primary">Book appointment</Link>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 18 }}>
        <h3>Your reminders</h3>
        <Link className="link-btn" to="/portal/notifications">View all</Link>
      </div>

      {items.length === 0 && (
        <div className="card muted">You have no reminders right now.</div>
      )}
      {items.slice(0, 5).map((n, i) => (
        <div className="card portal-alert" key={i}>
          <span className={`alert-dot ${n.severity}`} />
          <div className="li-body">
            <b>{n.title}</b>
            <small>{n.message}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
