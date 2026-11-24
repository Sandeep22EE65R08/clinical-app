import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { Clinic, Role } from '../types';
import { useAuth } from '../auth/AuthContext';
import { getClinic, getNotifications } from '../api/endpoints';
import { initials } from '../utils';

interface Item { to: string; label: string; icon: string; roles?: Role[]; }

const NAV: Item[] = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/patients', label: 'Patients', icon: '👥' },
  { to: '/appointments', label: 'Appointments', icon: '📅' },
  { to: '/queue', label: 'Queue / Tokens', icon: '🎟️' },
  { to: '/payments', label: 'Payments', icon: '💰' },
  { to: '/reports', label: 'Reports', icon: '📄' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/analytics', label: 'Analytics', icon: '📊', roles: ['Admin', 'Doctor'] },
  { to: '/expenses', label: 'Expenses', icon: '🧾', roles: ['Admin'] },
  { to: '/departments', label: 'Departments', icon: '🏥', roles: ['Admin'] },
  { to: '/staff', label: 'Staff', icon: '🧑‍⚕️', roles: ['Admin'] },
  { to: '/settings', label: 'Settings', icon: '⚙️', roles: ['Admin'] },
];

const MOBILE: Item[] = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/today', label: 'Today', icon: '📋' },
  { to: '/add-patient', label: 'Add', icon: '➕' },
  { to: '/patients', label: 'Patients', icon: '👥' },
  { to: '/payments', label: 'Money', icon: '💰' },
];

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const visible = NAV.filter((i) => !i.roles || hasRole(...i.roles));
  const [unread, setUnread] = useState(0);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    getNotifications().then((r) => setUnread(r.unreadCount)).catch(() => {});
    getClinic().then(setClinic).catch(() => {});
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/patients?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🏥</div>
          <div className="brand-text">
            <b>{user?.clinicName || 'Clinic'}</b>
            <small>Digital Clinic Register</small>
          </div>
        </div>
        <div className="nav-scroll">
          {visible.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.to === '/'} className="nav-link">
              <span className="nav-ico">{i.icon}</span> {i.label}
            </NavLink>
          ))}
        </div>
        <div className="clinic-card">
          <div className="avatar">{initials(user?.clinicName)}</div>
          <div style={{ minWidth: 0 }}>
            <b>{user?.clinicName}</b>
            {clinic?.address && <small>{clinic.address}</small>}
            {clinic?.phone && <small>{clinic.phone}</small>}
          </div>
        </div>
        <div className="app-version">v1.0.0</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <form className="search-box" onSubmit={submitSearch}>
            <span className="search-ico">🔍</span>
            <input placeholder="Search patient by name, mobile, village/town…"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="spacer" />
          <button className="icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
            🔔{unread > 0 && <span className="badge">{unread}</span>}
          </button>
          <div className="user-chip" onClick={logout} title="Click to logout">
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div className="u-name">{user?.name}</div>
              <div className="u-role">{user?.role}</div>
            </div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>

      <nav className="bottom-nav">
        {MOBILE.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.to === '/'}>
            <span className="nav-ico">{i.icon}</span>{i.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
