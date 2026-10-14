import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { Analytics as AnalyticsData } from '../types';
import { getAnalytics } from '../api/endpoints';
import { rupee } from '../utils';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const [a, setA] = useState<AnalyticsData | null>(null);
  useEffect(() => { getAnalytics().then(setA).catch(() => setA(null)); }, []);
  if (!a) return <p className="muted">Loading analytics…</p>;

  const maxLoc = Math.max(1, ...a.topLocations.map((l) => l.patientCount));

  return (
    <div>
      <h1 className="page-title">Clinic Analytics</h1>

      <h3>Patient Analytics</h3>
      <div className="grid cards" style={{ marginBottom: 16 }}>
        <StatCard label="Total Patients" value={a.totalPatients} />
        <StatCard label="New This Month" value={a.newPatientsThisMonth} />
        <StatCard label="Returning" value={a.returningPatients} />
        <StatCard label="Patients Today" value={a.patientsToday} />
        <StatCard label="This Week" value={a.patientsThisWeek} />
        <StatCard label="This Month" value={a.patientsThisMonth} />
      </div>

      <h3>Revenue Analytics</h3>
      <div className="grid cards" style={{ marginBottom: 16 }}>
        <StatCard label="Revenue This Month" value={rupee(a.revenueThisMonth)} tone="green" />
        <StatCard label="Avg. Consultation" value={rupee(a.averageConsultationFee)} />
        <StatCard label="Cash" value={rupee(a.cashTotal)} />
        <StatCard label="UPI" value={rupee(a.upiTotal)} />
        <StatCard label="Card" value={rupee(a.cardTotal)} />
        <StatCard label="Pending" value={rupee(a.pendingTotal)} tone="amber" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="card">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={a.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => rupee(Number(v))} />
              <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Top Patient Locations</h3>
          {a.topLocations.map((l) => (
            <div key={l.villageTownCity} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>{l.villageTownCity}</span>
                <strong>{l.patientCount} patients</strong>
              </div>
              <div style={{ height: 8, background: '#eef2ff', borderRadius: 4, marginTop: 4 }}>
                <div style={{ width: `${(l.patientCount / maxLoc) * 100}%`, height: '100%',
                  background: 'var(--primary)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
          {a.topLocations.length === 0 && <p className="muted">No location data yet.</p>}
        </div>
      </div>
    </div>
  );
}
