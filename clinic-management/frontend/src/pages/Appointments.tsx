import { useEffect, useState } from 'react';
import type { Appointment, AppointmentStatus, Patient, UserDto } from '../types';
import {
  createAppointment, getAppointments, getDoctors, searchPatients, updateAppointmentStatus,
} from '../api/endpoints';
import { apptStatusLabel, formatDate, formatTime, today, weekRange } from '../utils';

const STATUSES: AppointmentStatus[] =
  ['Scheduled', 'Waiting', 'InConsultation', 'Completed', 'Cancelled', 'NoShow'];

export default function Appointments() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [date, setDate] = useState(today());
  const [items, setItems] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<UserDto[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    const range = view === 'week'
      ? weekRange(new Date(date))
      : [date, date] as [string, string];
    getAppointments({ from: range[0], to: range[1] }).then(setItems).catch(() => setItems([]));
  };

  useEffect(() => { getDoctors().then(setDoctors).catch(() => {}); }, []);
  useEffect(load, [view, date]);

  const setStatus = (id: string, s: AppointmentStatus) =>
    updateAppointmentStatus(id, s).then(load).catch(() => {});

  const byDate = items.reduce<Record<string, Appointment[]>>((acc, a) => {
    (acc[a.scheduledDate] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Appointments</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : '➕ New Appointment'}
        </button>
      </div>

      {showForm && (
        <AppointmentForm doctors={doctors} onCreated={() => { setShowForm(false); load(); }} />
      )}

      <div className="toolbar">
        <div className="row" style={{ maxWidth: 360 }}>
          <button className={`btn ${view === 'day' ? 'btn-primary' : ''}`} onClick={() => setView('day')}>Day</button>
          <button className={`btn ${view === 'week' ? 'btn-primary' : ''}`} onClick={() => setView('week')}>Week</button>
        </div>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      {Object.keys(byDate).length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 40 }}>📅</div>
          <p className="muted">No appointments for this {view}.</p>
        </div>
      )}

      {Object.entries(byDate).sort().map(([d, list]) => (
        <div key={d} style={{ marginBottom: 16 }}>
          {view === 'week' && <h3>{formatDate(d)}</h3>}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="table">
              <thead><tr>
                <th>Time</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {list.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)).map((a) => (
                  <tr key={a.id}>
                    <td><strong>{formatTime(a.scheduledTime)}</strong></td>
                    <td>{a.patientName} <span className="muted">({a.patientAge})</span></td>
                    <td>{a.doctorName}</td>
                    <td>{a.reason || '-'}</td>
                    <td><span className="badge">{apptStatusLabel(a.status)}</span></td>
                    <td>
                      <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value as AppointmentStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{apptStatusLabel(s)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function AppointmentForm({ doctors, onCreated }: { doctors: UserDto[]; onCreated: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) return;
    const t = setTimeout(() => { searchPatients(q).then(setResults).catch(() => setResults([])); }, 250);
    return () => clearTimeout(t);
  }, [q, patient]);

  const submit = () => {
    if (!patient) return;
    setSaving(true);
    createAppointment({
      patientId: patient.id, doctorId: doctorId || undefined,
      scheduledDate: date, scheduledTime: time + ':00', reason: reason || undefined,
    }).then(onCreated).finally(() => setSaving(false));
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {!patient ? (
        <div className="field">
          <label>Search patient</label>
          <input className="input" placeholder="Name, mobile or village…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          {results.length > 0 && (
            <div style={{ marginTop: 8, maxHeight: 160, overflowY: 'auto' }}>
              {results.map((p) => (
                <div key={p.id} className="nav-link" style={{ cursor: 'pointer' }} onClick={() => setPatient(p)}>
                  {p.name} · {p.age} · {p.villageTownCity}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p><strong>{patient.name}</strong> ({patient.age}) · {patient.villageTownCity}{' '}
          <button className="btn" onClick={() => setPatient(null)}>Change</button></p>
      )}
      <div className="row" style={{ marginTop: 8 }}>
        <div className="field"><label>Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Auto</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select></div>
        <div className="field"><label>Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label>Time</label>
          <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
      </div>
      <div className="field"><label>Reason</label>
        <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fever, review report" /></div>
      <button className="btn btn-primary" disabled={!patient || saving} onClick={submit}>
        {saving ? 'Saving…' : 'Create Appointment'}</button>
    </div>
  );
}
