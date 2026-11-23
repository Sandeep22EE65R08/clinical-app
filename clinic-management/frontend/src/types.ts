export type Role = 'Admin' | 'Doctor' | 'Receptionist' | 'Nurse' | 'Staff' | 'Patient';
export type Gender = 'Male' | 'Female' | 'Other';
export type VisitType = 'NewConsultation' | 'FollowUp' | 'Emergency' | 'Other';
export type PaymentStatus = 'Paid' | 'Pending' | 'PartiallyPaid';
export type PaymentMethod = 'Cash' | 'Upi' | 'Card' | 'Other';
export type AppointmentStatus =
  'Scheduled' | 'Waiting' | 'InConsultation' | 'Completed' | 'Cancelled' | 'NoShow';
export type VisitStatus = 'Waiting' | 'InConsultation' | 'Completed' | 'Skipped';

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  username: string;
  role: Role;
  clinicId: string;
  clinicName: string;
}

export interface Patient {
  id: string;
  name: string;
  mobileNumber?: string | null;
  age: number;
  gender: Gender;
  villageTownCity: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  villageTownCity: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  visitTime: string;
  visitType: VisitType;
  consultationFee: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  tokenNumber: number;
  visitStatus: VisitStatus;
  notes?: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  mobileNumber?: string | null;
  patientAge: number;
  villageTownCity: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  scheduledTime: string;
  reason?: string | null;
  status: AppointmentStatus;
}

export interface QueueEntry {
  visitId: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  villageTownCity: string;
  doctorId: string;
  doctorName: string;
  visitStatus: VisitStatus;
}

export interface QueueState {
  nowServing?: QueueEntry | null;
  waiting: QueueEntry[];
  completed: QueueEntry[];
  waitingCount: number;
}

export interface PatientHistory {
  patient: Patient;
  visitCount: number;
  lastVisitDate?: string | null;
  totalPaid: number;
  totalPending: number;
  visits: Visit[];
}

export interface ChartPoint { label: string; value: number; }

export interface Dashboard {
  patientsToday: number;
  collectionToday: number;
  pendingToday: number;
  newPatientsToday: number;
  weeklyPatients: ChartPoint[];
  weeklyRevenue: ChartPoint[];
  appointmentsToday: number;
  followUpsToday: number;
  pendingPatients: number;
  patientsDelta: number | null;
  collectionDelta: number | null;
  appointmentsDelta: number | null;
  followUpsDelta: number | null;
  totalPatients: number;
  collectionThisMonth: number;
  avgConsultationFee: number;
  newPatientsThisMonth: number;
  topLocations: LocationStat[];
  monthlyPatients: ChartPoint[];
  monthlyRevenue: ChartPoint[];
}

export interface DailyReport {
  date: string;
  patients: number;
  totalCollection: number;
  consultationFees: number;
  followUpFees: number;
  otherFees: number;
  cash: number;
  upi: number;
  card: number;
  pending: number;
}

export interface LocationStat { villageTownCity: string; patientCount: number; }

export interface Analytics {
  totalPatients: number;
  newPatientsThisMonth: number;
  returningPatients: number;
  patientsToday: number;
  patientsThisWeek: number;
  patientsThisMonth: number;
  revenueThisMonth: number;
  averageConsultationFee: number;
  cashTotal: number;
  upiTotal: number;
  cardTotal: number;
  pendingTotal: number;
  topLocations: LocationStat[];
  monthlyRevenue: ChartPoint[];
}

export interface Notification {
  type: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  unreadCount: number;
  items: Notification[];
}

export interface DoctorStat {
  doctorId: string;
  doctorName: string;
  patients: number;
  collection: number;
}

export interface UserDto {
  id: string;
  name: string;
  username: string;
  role: Role;
  phone?: string | null;
  consultationFee?: number | null;
  specialization?: string | null;
  isActive: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  defaultConsultationFee: number;
  workingHours?: string | null;
  isListedPublicly: boolean;
}

// ---- Public "Find care" discovery ----
export interface Symptom { id: string; label: string; labelHi: string; department: string; }
export interface Triage {
  isEmergency: boolean;
  emergencyMessage?: string | null;
  departments: { department: string; keyword: string }[];
  disclaimer: string;
}
export interface DiscoverDoctor {
  id: string; name: string; specialization?: string | null; consultationFee?: number | null;
}
export interface DiscoverClinic {
  id: string; name: string; address: string; phone?: string | null;
  workingHours?: string | null; defaultConsultationFee: number; doctors: DiscoverDoctor[];
}
export interface DiscoverResult { triage: Triage; clinics: DiscoverClinic[]; }

export type ExpenseCategory =
  'StaffSalary' | 'Rent' | 'Electricity' | 'MedicalSupplies'
  | 'Equipment' | 'Maintenance' | 'Other';

export interface Expense {
  id: string;
  expenseDate: string;
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
  createdAt: string;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  amount: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  revenue: number;
  net: number;
  byCategory: CategoryTotal[];
}

// ---- Patient portal ----

export interface PublicClinic {
  id: string;
  name: string;
  address: string;
}

export interface PortalProfile {
  id: string;
  name: string;
  mobileNumber?: string | null;
  age: number;
  gender: Gender;
  villageTownCity: string;
  clinicName: string;
  clinicPhone?: string | null;
  clinicAddress?: string | null;
}

export interface PortalDoctor {
  id: string;
  name: string;
  specialization?: string | null;
}

export interface PortalVisit {
  id: string;
  visitDate: string;
  visitTime: string;
  doctorName: string;
  visitType: VisitType;
  consultationFee: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
}
