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

export interface VoiceEntry {
  name?: string; age?: string; mobileNumber?: string;
  gender?: 'Male' | 'Female'; villageTownCity?: string; consultationFee?: string;
}

// Turns a spoken sentence (English / Hinglish) into form fields, e.g.
// "Ramesh Kumar, age 42, Rampur, consultation fee 500". The user always reviews
// the filled form before saving, so this only needs to be a best-effort guess.
export const parseVoiceEntry = (text: string): VoiceEntry => {
  const out: VoiceEntry = {};
  let rest = ` ${text.replace(/[,.]/g, ' , ')} `;
  const take = (re: RegExp) => {
    const m = rest.match(re);
    if (m) rest = rest.replace(m[0], ' , ');
    return m;
  };

  const fee = take(/(?:consultation\s+)?(?:fees?|fee|charge|फीस)\s*(?:is|of|rs\.?|rupees?|₹)?\s*(\d{2,5})/i)
    ?? take(/(?:rs\.?|rupees?|₹)\s*(\d{2,5})/i) ?? take(/(\d{2,5})\s*(?:rupees?|rs\b|रुपये)/i);
  if (fee) out.consultationFee = fee[1];

  const mobile = take(/(?:mobile|phone|number|मोबाइल)?\s*(\d[\d\s]{8,12}\d)/i);
  if (mobile) {
    const digits = mobile[1].replace(/\s/g, '');
    if (digits.length === 10) out.mobileNumber = digits;
  }

  const age = take(/(?:age|umar|umr|उम्र)\s*(?:is)?\s*(\d{1,3})/i)
    ?? take(/(\d{1,3})\s*(?:years?|yrs?|saal|sal|साल|वर्ष)/i);
  if (age) out.age = age[1];

  if (take(/\b(female|woman|girl|lady|ladki|mahila|महिला)\b/i)) out.gender = 'Female';
  else if (take(/\b(male|man|boy|purush|ladka|पुरुष)\b/i)) out.gender = 'Male';

  // Remaining comma-separated pieces: first = name, second = village/town/city.
  const parts = rest.split(',').map((s) => s.replace(/\b(patient|name|is|village|from|of|in)\b/gi, ' ')
    .replace(/\s+/g, ' ').trim()).filter(Boolean);
  const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
  if (parts[0]) out.name = cap(parts[0]);
  if (parts[1]) out.villageTownCity = cap(parts[1]);
  return out;
};


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
