import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { portalGetNotifications } from '../api/endpoints';
import { initials } from '../utils';

const NAV = [
  { to: '/portal', label: 'Home', icon: '🏠' },
  { to: '/portal/book', label: 'Book', icon: '📅' },
  { to: '/portal/appointments', label: 'Appointments', icon: '🗓️' },
  { to: '/portal/visits', label: 'Visits', icon: '📄' },
  { to: '/portal/notifications', label: 'Alerts', icon: '🔔' },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    portalGetNotifications().then((r) => setUnread(r.unreadCount)).catch(() => {});
  }, []);

  const doLogout = () => { logout(); navigate('/portal/login'); };

  return (
    <div className="portal">
      <header className="portal-top">
        <div className="portal-brand">
          <div className="brand-logo">🏥</div>
          <div>
            <b>{user?.clinicName || 'Clinic'}</b>
            <small>Patient Portal</small>
          </div>
        </div>
        <div className="spacer" />
        <button className="icon-btn" title="Alerts"
          onClick={() => navigate('/portal/notifications')}>
          🔔{unread > 0 && <span className="badge">{unread}</span>}
        </button>
        <div className="user-chip" onClick={doLogout} title="Click to logout">
          <div className="avatar">{initials(user?.name)}</div>
          <div>
            <div className="u-name">{user?.name}</div>
            <div className="u-role">Patient</div>
          </div>
        </div>
      </header>

      <nav className="portal-tabs">
        {NAV.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.to === '/portal'} className="portal-tab">
            <span className="nav-ico">{i.icon}</span>{i.label}
          </NavLink>
        ))}
      </nav>

      <main className="portal-content"><Outlet /></main>
    </div>
  );
}
