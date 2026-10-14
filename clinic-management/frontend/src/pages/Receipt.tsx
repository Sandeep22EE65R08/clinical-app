import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Clinic, Visit } from '../types';
import { getClinic, getVisit } from '../api/endpoints';
import { formatDate, formatTime, paymentLabel, rupee } from '../utils';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    if (id) getVisit(id).then(setVisit).catch(() => setVisit(null));
    getClinic().then(setClinic).catch(() => {});
  }, [id]);

  if (!visit) return <p className="muted">Loading receipt…</p>;
  const receiptNo = `R-${visit.visitDate.replaceAll('-', '')}-${String(visit.tokenNumber).padStart(3, '0')}`;

  return (
    <div>
      <div className="toolbar no-print">
        <button className="btn" onClick={() => navigate('/today')}>← Back</button>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print</button>
        <button className="btn" onClick={() => window.print()}>⬇ Download PDF</button>
      </div>

      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }} id="receipt">
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border)', paddingBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{clinic?.name ?? 'Clinic'}</h2>
          <div className="muted">{clinic?.address}</div>
          {clinic?.phone && <div className="muted">📞 {clinic.phone}</div>}
        </div>
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <span className="token" style={{ fontSize: 16 }}>Token #{visit.tokenNumber}</span>
        </div>
        <Row label="Receipt No." value={receiptNo} />
        <Row label="Date" value={formatDate(visit.visitDate)} />
        <Row label="Time" value={formatTime(visit.visitTime)} />
        <Row label="Patient" value={visit.patientName} />
        <Row label="Village/Town/City" value={visit.villageTownCity} />
        <Row label="Doctor" value={visit.doctorName} />
        <hr style={{ border: 'none', borderTop: '1px dashed var(--border)' }} />
        <Row label="Consultation Fee" value={rupee(visit.consultationFee)} />
        <Row label="Amount Paid" value={rupee(visit.amountPaid)} />
        <Row label="Payment Method" value={visit.paymentMethod === 'Upi' ? 'UPI' : visit.paymentMethod} />
        <Row label="Payment Status" value={paymentLabel(visit.paymentStatus)} bold />
        <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
          Thank you. Get well soon!
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0',
      fontWeight: bold ? 700 : 400 }}>
      <span className="muted">{label}</span><span>{value}</span>
    </div>
  );
}
