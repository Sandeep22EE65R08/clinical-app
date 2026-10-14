import { useEffect, useState } from 'react';
import type { DailyReport } from '../types';
import { getDailyReport } from '../api/endpoints';
import { rupee, today } from '../utils';
import StatCard from '../components/StatCard';

export default function Payments() {
  const [date, setDate] = useState(today());
  const [r, setR] = useState<DailyReport | null>(null);

  useEffect(() => { getDailyReport(date).then(setR).catch(() => setR(null)); }, [date]);

  return (
    <div>
      <h1 className="page-title">Fee & Collection</h1>
      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {!r ? <p className="muted">Loading…</p> : (
        <>
          <div className="grid cards" style={{ marginBottom: 16 }}>
            <StatCard label="Patients" value={r.patients} />
            <StatCard label="Total Collection" value={rupee(r.totalCollection)} tone="green" />
            <StatCard label="Pending" value={rupee(r.pending)} tone="amber" />
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="card">
              <h3>Collection by Type</h3>
              <Line label="Consultation Fees" value={r.consultationFees} />
              <Line label="Follow-up Fees" value={r.followUpFees} />
              <Line label="Other Fees" value={r.otherFees} />
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <Line label="Total" value={r.totalCollection} bold />
            </div>
            <div className="card">
              <h3>Collection by Method</h3>
              <Line label="Cash" value={r.cash} />
              <Line label="UPI" value={r.upi} />
              <Line label="Card" value={r.card} />
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <Line label="Pending Payments" value={r.pending} bold />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0',
      fontWeight: bold ? 700 : 400 }}>
      <span className={bold ? '' : 'muted'}>{label}</span>
      <span>{rupee(value)}</span>
    </div>
  );
}
