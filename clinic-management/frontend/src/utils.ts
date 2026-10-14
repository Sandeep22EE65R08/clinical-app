import type { AppointmentStatus, PaymentStatus, VisitType } from './types';

export const rupee = (n: number) =>
  '₹' + (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const today = () => new Date().toISOString().slice(0, 10);

export const formatDate = (d?: string | null) => {
  if (!d) return '-';
  const date = new Date(d.length <= 10 ? d + 'T00:00:00' : d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (t?: string | null) => (t ? t.slice(0, 5) : '-');

// e.g. "18 Sep 2026" and weekday "Friday"
export const formatLongDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const weekday = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'long' });

export const initials = (name?: string | null) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

export const paymentBadge = (s: PaymentStatus) =>
  s === 'Paid' ? 'paid' : s === 'PartiallyPaid' ? 'partial' : 'pending';

export const paymentLabel = (s: PaymentStatus) =>
  s === 'PartiallyPaid' ? 'Partial' : s;

export const visitLabel = (v: VisitType) =>
  v === 'NewConsultation' ? 'Consultation' : v === 'FollowUp' ? 'Follow-up' : v;

export const apptStatusLabel = (s: AppointmentStatus) =>
  s === 'InConsultation' ? 'In Consultation' : s === 'NoShow' ? 'No Show' : s;

// Returns [Monday, Sunday] ISO date strings for the week containing `d`.
export const weekRange = (d: Date): [string, string] => {
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return [iso(monday), iso(sunday)];
};
