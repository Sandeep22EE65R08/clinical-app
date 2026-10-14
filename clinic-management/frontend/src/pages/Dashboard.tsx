import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { Appointment, Dashboard as DashboardData, DailyReport, Visit } from '../types';
import {
  getAppointments, getDailyReport, getDashboard, getTodayVisits,
} from '../api/endpoints';
import { formatLongDate, rupee, today, weekday } from '../utils';
import StatTile from '../components/StatTile';
import {
  CollectionDonut, QuickStats, RecentPatients, TopLocations, UpcomingList,
} from '../components/DashboardPanels';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [range, setRange] = useState<'today' | 'week' | 'month'>('week');
  const navigate = useNavigate();

  useEffect(() => {
    const t = today();
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    getDashboard().then(setData).catch(() => setData(null));
    getDailyReport().then(setReport).catch(() => setReport(null));
    getTodayVisits({}).then(setVisits).catch(() => setVisits([]));
    getAppointments({ from: t, to: in30 }).then(setAppts).catch(() => setAppts([]));
  }, []);

  if (!data) return <p className="muted">Loading today's overview…</p>;

  const now = new Date();
  const patientData = range === 'today' ? data.weeklyPatients.slice(-1)
    : range === 'month' ? data.monthlyPatients : data.weeklyPatients;
  const revenueData = range === 'today' ? data.weeklyRevenue.slice(-1)
    : range === 'month' ? data.monthlyRevenue : data.weeklyRevenue;

  return (
    <div>
      <div className="dash-head">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
          <div className="subtitle">Here's what's happening at your clinic today.</div>
        </div>
        <div className="date-chip">📅 {formatLongDate(now)} · {weekday(now)}</div>
      </div>

      <div className="stat-tiles">
        <StatTile icon="👥" tone="blue" label="Today's Patients" value={data.patientsToday}
          trend={data.patientsDelta} />
        <StatTile icon="₹" tone="green" label="Today's Collection" value={rupee(data.collectionToday)}
          trend={data.collectionDelta} />
        <StatTile icon="📅" tone="purple" label="Appointments Today" value={data.appointmentsToday}
          trend={data.appointmentsDelta} />
        <StatTile icon="⏰" tone="amber" label="Pending Payments" value={rupee(data.pendingToday)}
          sub={`${data.pendingPatients} patient${data.pendingPatients === 1 ? '' : 's'}`} />
        <StatTile icon="🔁" tone="red" label="Follow-ups Today" value={data.followUpsToday}
          trend={data.followUpsDelta} />
      </div>

      <div className="dash-row dash-2-1">
        <div className="card">
          <div className="section-head">
            <h3>Patient &amp; Collection Trend</h3>
            <div className="seg">
              <button className={range === 'today' ? 'active' : ''} onClick={() => setRange('today')}>Today</button>
              <button className={range === 'week' ? 'active' : ''} onClick={() => setRange('week')}>7 Days</button>
              <button className={range === 'month' ? 'active' : ''} onClick={() => setRange('month')}>30 Days</button>
            </div>
          </div>
          <div className="chart-pair">
            <div>
              <div className="chart-title">Patients</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={patientData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false}
                    domain={[0, (max: number) => Math.max(4, Math.ceil(max))]} />
                  <Tooltip cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]}
                    maxBarSize={48} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="chart-title">Collection (₹)</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} width={56}
                    domain={[0, (max: number) => Math.max(100, Math.ceil(max * 1.1))]}
                    tickFormatter={(v) => rupee(Number(v))} />
                  <Tooltip formatter={(v) => [rupee(Number(v)), 'Revenue']} />
                  <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2}
                    fill="url(#revFill)" name="Revenue"
                    dot={{ r: 3, fill: '#16a34a' }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16 }}>Today's Quick Actions</h3>
          <button className="btn btn-primary btn-block" style={{ marginTop: 12 }}
            onClick={() => navigate('/add-patient')}>➕ Add Patient</button>
          <div className="qa-grid">
            <button className="qa-btn" onClick={() => navigate('/appointments')}>
              <span className="qa-ico">📅</span>New Appointment</button>
            <button className="qa-btn" onClick={() => navigate('/queue')}>
              <span className="qa-ico">🎟️</span>Generate Token</button>
            <button className="qa-btn" onClick={() => navigate('/payments')}>
              <span className="qa-ico">💳</span>Collect Payment</button>
            <button className="qa-btn" onClick={() => navigate('/queue')}>
              <span className="qa-ico">👥</span>View Queue</button>
          </div>
        </div>
      </div>

      <div className="dash-row dash-3">
        <RecentPatients visits={visits} />
        {report && <CollectionDonut report={report} />}
        <UpcomingList items={appts} />
      </div>

      <div className="dash-row dash-2-1">
        <QuickStats totalPatients={data.totalPatients} collection={data.collectionThisMonth}
          avgFee={data.avgConsultationFee} newPatients={data.newPatientsThisMonth} />
        <TopLocations locations={data.topLocations} />
      </div>
    </div>
  );
}
