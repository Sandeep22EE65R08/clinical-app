import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserDto, Visit } from '../types';
import { getDoctors, getTodayVisits } from '../api/endpoints';
import { formatTime, paymentBadge, paymentLabel, rupee, visitLabel } from '../utils';

export default function TodayPatients() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<UserDto[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { getDoctors().then(setDoctors).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      getTodayVisits({
        doctorId: doctorId || undefined,
        paymentStatus: paymentStatus || undefined,
        search: search || undefined,
      }).then(setVisits).catch(() => setVisits([]));
    }, 200);
    return () => clearTimeout(t);
  }, [doctorId, paymentStatus, search]);

  return (
    <div>
      <h1 className="page-title">Today's Patients</h1>
      <div className="toolbar">
        <input className="input" placeholder="Search name or village…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          <option value="">All Doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="PartiallyPaid">Partially Paid</option>
        </select>
        <button className="btn btn-primary" onClick={() => navigate('/add-patient')}>➕ Add Patient</button>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead><tr>
            <th>Token</th><th>Name</th><th>Age</th><th>Village/Town/City</th>
            <th>Visit</th><th>Fee</th><th>Payment</th><th>Time</th><th>Doctor</th><th></th>
          </tr></thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id}>
                <td><span className="token">#{v.tokenNumber}</span></td>
                <td><strong>{v.patientName}</strong></td>
                <td>{v.patientAge}</td>
                <td>{v.villageTownCity}</td>
                <td>{visitLabel(v.visitType)}</td>
                <td>{rupee(v.consultationFee)}</td>
                <td><span className={`badge ${paymentBadge(v.paymentStatus)}`}>{paymentLabel(v.paymentStatus)}</span></td>
                <td>{formatTime(v.visitTime)}</td>
                <td>{v.doctorName}</td>
                <td><button className="btn" onClick={() => navigate(`/receipt/${v.id}`)}>Receipt</button></td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr><td colSpan={10} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                No patients yet today.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
