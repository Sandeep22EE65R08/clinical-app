import { useEffect, useState } from 'react';
import type { DailyReport, DoctorStat } from '../types';
import { getDailyReport, getDoctorStats } from '../api/endpoints';
import { rupee, today } from '../utils';

export default function Reports() {
  const [date, setDate] = useState(today());
  const [r, setR] = useState<DailyReport | null>(null);
  const [docs, setDocs] = useState<DoctorStat[]>([]);

  useEffect(() => {
    getDailyReport(date).then(setR).catch(() => setR(null));
    getDoctorStats(date).then(setDocs).catch(() => setDocs([]));
  }, [date]);

  const downloadCsv = () => {
    if (!r) return;
    const rows = [
      ['Date', r.date],
      ['Patients', r.patients],
      ['Total Collection', r.totalCollection],
      ['Cash', r.cash], ['UPI', r.upi], ['Card', r.card], ['Pending', r.pending],
      [], ['Doctor', 'Patients', 'Collection'],
      ...docs.map((d) => [d.doctorName, d.patients, d.collection]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `report-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn" onClick={downloadCsv}>⬇ Download CSV</button>
        <button className="btn" onClick={() => window.print()}>🖨 Print</button>
      </div>

      {r && (
        <div className="grid cards" style={{ marginBottom: 16 }}>
          <div className="card stat"><div className="label">Patients</div><div className="value">{r.patients}</div></div>
          <div className="card stat"><div className="label">Collection</div><div className="value green">{rupee(r.totalCollection)}</div></div>
          <div className="card stat"><div className="label">Cash</div><div className="value">{rupee(r.cash)}</div></div>
          <div className="card stat"><div className="label">UPI</div><div className="value">{rupee(r.upi)}</div></div>
          <div className="card stat"><div className="label">Pending</div><div className="value amber">{rupee(r.pending)}</div></div>
        </div>
      )}

      <h3>Doctor-wise Report</h3>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Doctor</th><th>Patients</th><th>Collection</th></tr></thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.doctorId}>
                <td><strong>{d.doctorName}</strong></td>
                <td>{d.patients}</td><td>{rupee(d.collection)}</td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr><td colSpan={3} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                No data for this date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
