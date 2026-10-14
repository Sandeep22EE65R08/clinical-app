import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { portalBookAppointment, portalGetDoctors } from '../../api/endpoints';
import type { PortalDoctor } from '../../types';
import { today } from '../../utils';

export default function PortalBook() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<PortalDoctor[]>([]);
  const [form, setForm] = useState({
    doctorId: '', scheduledDate: today(), scheduledTime: '10:00', reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    portalGetDoctors().then(setDoctors).catch(() => {});
  }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await portalBookAppointment({
        doctorId: form.doctorId || undefined,
        scheduledDate: form.scheduledDate,
        scheduledTime: `${form.scheduledTime}:00`,
        reason: form.reason.trim() || undefined,
      });
      navigate('/portal/appointments');
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message)
        setError(err.response.data.message);
      else setError('Could not book the appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Book an appointment</h1>
      <div className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Doctor</label>
            <select className="input" value={form.doctorId} onChange={set('doctorId')}>
              <option value="">Any available doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.specialization ? ` — ${d.specialization}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="field">
              <label>Date</label>
              <input className="input" type="date" min={today()}
                value={form.scheduledDate} onChange={set('scheduledDate')} required />
            </div>
            <div className="field">
              <label>Time</label>
              <input className="input" type="time" value={form.scheduledTime}
                onChange={set('scheduledTime')} required />
            </div>
          </div>
          <div className="field">
            <label>Reason (optional)</label>
            <textarea className="input" rows={3} value={form.reason} onChange={set('reason')}
              placeholder="e.g. Fever and cough for 3 days" />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Booking…' : 'Confirm booking'}
          </button>
          <p className="muted" style={{ fontSize: 13, marginTop: 10, marginBottom: 0 }}>
            You'll get a confirmation SMS on your registered mobile number.
          </p>
        </form>
      </div>
    </div>
  );
}
