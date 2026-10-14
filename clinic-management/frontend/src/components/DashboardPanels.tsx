import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { Appointment, DailyReport, LocationStat, Visit } from '../types';
import { formatDate, formatTime, initials, paymentBadge, paymentLabel, rupee, today } from '../utils';

export function RecentPatients({ visits }: { visits: Visit[] }) {
  const navigate = useNavigate();
  const rows = visits.slice(0, 6);
  return (
    <div className="card">
      <div className="section-head">
        <h3>Recent Patients</h3>
        <button className="link-btn" onClick={() => navigate('/today')}>View All</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead><tr>
            <th>Token</th><th>Name</th><th>Age</th><th>Village/Town</th><th>Fee</th><th>Status</th><th>Time</th>
          </tr></thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td><span className="token">#{v.tokenNumber}</span></td>
                <td><strong>{v.patientName}</strong></td>
                <td>{v.patientAge}</td>
                <td>{v.villageTownCity}</td>
                <td>{rupee(v.consultationFee)}</td>
                <td><span className={`badge ${paymentBadge(v.paymentStatus)}`}>{paymentLabel(v.paymentStatus)}</span></td>
                <td>{formatTime(v.visitTime)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 20 }}>No patients yet today.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PIE = [
  { key: 'cash', label: 'Cash', color: '#16a34a', soft: 'var(--green-soft)' },
  { key: 'upi', label: 'UPI', color: '#2563eb', soft: 'var(--blue-soft)' },
  { key: 'card', label: 'Card', color: '#7c3aed', soft: 'var(--purple-soft)' },
  { key: 'pending', label: 'Pending', color: '#d97706', soft: 'var(--amber-soft)' },
] as const;

export function CollectionDonut({ report }: { report: DailyReport }) {
  const data = PIE.map((p) => ({ ...p, value: report[p.key] }));
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="card">
      <h3 style={{ fontSize: 16 }}>Today's Collection Breakdown</h3>
      <div style={{ position: 'relative', height: 160, marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={54} outerRadius={76} paddingAngle={2}>
              {data.map((d) => <Cell key={d.key} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{rupee(report.totalCollection)}</div>
            <div className="muted" style={{ fontSize: 11 }}>Total</div>
          </div>
        </div>
      </div>
      <div className="legend">
        {data.map((d) => (
          <div key={d.key} className="legend-row">
            <span className="legend-dot" style={{ background: d.color }} />
            <span>{d.label}</span>
            <span className="amt">{rupee(d.value)}</span>
            <span className="pct">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="summary-grid">
        {data.map((d) => (
          <div key={d.key} className="summary-cell" style={{ background: d.soft, color: d.color }}>
            {d.label}
            <b>{rupee(d.value)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UpcomingList({ items }: { items: Appointment[] }) {
  const navigate = useNavigate();
  const t = today();
  const upcoming = items
    .filter((a) => a.scheduledDate > t && a.status !== 'Cancelled')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5);
  const daysLeft = (d: string) =>
    Math.round((new Date(d + 'T00:00:00').getTime() - new Date(t + 'T00:00:00').getTime()) / 86400000);
  return (
    <div className="card">
      <div className="section-head">
        <h3>Upcoming Appointments</h3>
        <button className="link-btn" onClick={() => navigate('/appointments')}>View All</button>
      </div>
      {upcoming.map((a) => {
        const n = daysLeft(a.scheduledDate);
        return (
          <div key={a.id} className="list-item">
            <div className="avatar" style={{ background: '#e2e8f0', color: '#0b1437' }}>{initials(a.patientName)}</div>
            <div className="li-body">
              <b>{a.patientName}</b>
              <small>{formatDate(a.scheduledDate)} · {a.reason || 'Visit'}</small>
            </div>
            <span className={`days-badge ${n <= 2 ? 'soon' : ''}`}>{n} day{n === 1 ? '' : 's'} left</span>
          </div>
        );
      })}
      {upcoming.length === 0 && <p className="muted" style={{ padding: '8px 0' }}>No upcoming appointments.</p>}
    </div>
  );
}

interface QuickStatsProps {
  totalPatients: number;
  collection: number;
  avgFee: number;
  newPatients: number;
}

export function QuickStats({ totalPatients, collection, avgFee, newPatients }: QuickStatsProps) {
  const cells = [
    { ico: '👥', tone: 'blue', label: 'Total Patients', value: totalPatients },
    { ico: '₹', tone: 'green', label: 'Total Collection', value: rupee(collection) },
    { ico: '📊', tone: 'purple', label: 'Avg. Consultation', value: rupee(avgFee) },
    { ico: '✨', tone: 'amber', label: 'New Patients', value: newPatients },
  ];
  return (
    <div className="card">
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>Quick Stats <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>(This Month)</span></h3>
      <div className="qa-grid">
        {cells.map((c) => (
          <div key={c.label} className="qa-btn" style={{ cursor: 'default' }}>
            <div className={`stat-ico ${c.tone}`} style={{ width: 36, height: 36, fontSize: 16 }}>{c.ico}</div>
            <div className="muted" style={{ fontSize: 12 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopLocations({ locations }: { locations: LocationStat[] }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>Top Patient Locations</h3>
      {locations.slice(0, 6).map((l) => (
        <div key={l.villageTownCity} className="loc-row">
          <span>📍</span><span>{l.villageTownCity}</span>
          <span className="loc-count">{l.patientCount}</span>
        </div>
      ))}
      {locations.length === 0 && <p className="muted">No location data yet.</p>}
    </div>
  );
}
