import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';
import { getNotifications } from '../api/endpoints';

const ICON: Record<string, string> = {
  PendingPayment: '💰',
  OutstandingTotal: '⚠️',
  DailySummary: '📊',
  Appointment: '📅',
  FollowUp: '🔔',
};

const TONE: Record<string, { bg: string; border: string }> = {
  warning: { bg: '#fffbeb', border: '#f59e0b' },
  error: { bg: '#fef2f2', border: '#ef4444' },
  info: { bg: '#f0f9ff', border: '#0ea5e9' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[] | null>(null);

  useEffect(() => {
    getNotifications().then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  if (!items) return <p className="muted">Loading notifications…</p>;

  return (
    <div>
      <h1 className="page-title">Notifications</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Alerts for pending payments and daily activity. SMS/WhatsApp reminders can be added later.
      </p>

      {items.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <p className="muted">You're all caught up. No notifications right now.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((n, i) => {
          const tone = TONE[n.severity] ?? TONE.info;
          return (
            <div
              key={i}
              className="card"
              onClick={() => n.link && navigate(n.link)}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: tone.bg, borderLeft: `4px solid ${tone.border}`,
                cursor: n.link ? 'pointer' : 'default',
              }}
            >
              <div style={{ fontSize: 22 }}>{ICON[n.type] ?? '🔔'}</div>
              <div style={{ flex: 1 }}>
                <strong>{n.title}</strong>
                <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>{n.message}</div>
              </div>
              {n.link && <span className="muted" style={{ fontSize: 18 }}>›</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
