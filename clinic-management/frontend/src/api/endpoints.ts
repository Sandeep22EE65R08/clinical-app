import { api } from './client';
import type {
  Analytics, Appointment, AppointmentStatus, AuthResponse, Clinic, DailyReport,
  Dashboard, DoctorStat, Expense, ExpenseSummary, NotificationsResponse, Patient, PatientHistory,
  PortalDoctor, PortalProfile, PortalVisit, PublicClinic,
  QueueState, UserDto, Visit,
} from '../types';

export const login = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export interface RegisterClinicBody {
  clinicName: string;
  address: string;
  phone?: string;
  adminName: string;
  username: string;
  password: string;
  includeSampleData?: boolean;
}
export const registerClinic = (body: RegisterClinicBody) =>
  api.post<AuthResponse>('/auth/register', body).then((r) => r.data);

// Patients
export const searchPatients = (q?: string) =>
  api.get<Patient[]>('/patients', { params: { q } }).then((r) => r.data);
export const getPatient = (id: string) =>
  api.get<Patient>(`/patients/${id}`).then((r) => r.data);
export const getPatientHistory = (id: string) =>
  api.get<PatientHistory>(`/patients/${id}/history`).then((r) => r.data);
export const createPatient = (body: Partial<Patient>) =>
  api.post<Patient>('/patients', body).then((r) => r.data);
export const findExisting = (mobile?: string, name?: string, age?: number) =>
  api.get<Patient>('/patients/find-existing', { params: { mobile, name, age } })
    .then((r) => r.data).catch(() => null);

// Visits
export const getTodayVisits = (params: { doctorId?: string; paymentStatus?: string; search?: string }) =>
  api.get<Visit[]>('/visits/today', { params }).then((r) => r.data);
export const getVisit = (id: string) =>
  api.get<Visit>(`/visits/${id}`).then((r) => r.data);
export const createVisit = (body: Record<string, unknown>) =>
  api.post<Visit>('/visits', body).then((r) => r.data);
export const quickRegister = (body: Record<string, unknown>) =>
  api.post<{ patient: Patient; visit: Visit }>('/visits/quick-register', body).then((r) => r.data);
export const updatePayment = (id: string, body: Record<string, unknown>) =>
  api.put<Visit>(`/visits/${id}/payment`, body).then((r) => r.data);

// Reports & dashboard
export const getDashboard = () => api.get<Dashboard>('/dashboard').then((r) => r.data);
export const getDailyReport = (date?: string) =>
  api.get<DailyReport>('/reports/daily', { params: { date } }).then((r) => r.data);
export const getDoctorStats = (date?: string) =>
  api.get<DoctorStat[]>('/reports/doctor-stats', { params: { date } }).then((r) => r.data);
export const getAnalytics = () => api.get<Analytics>('/analytics').then((r) => r.data);
export const getNotifications = () =>
  api.get<NotificationsResponse>('/notifications').then((r) => r.data);

// Appointments
export const getAppointments = (params: { from?: string; to?: string; doctorId?: string }) =>
  api.get<Appointment[]>('/appointments', { params }).then((r) => r.data);
export const createAppointment = (body: Record<string, unknown>) =>
  api.post<Appointment>('/appointments', body).then((r) => r.data);
export const updateAppointmentStatus = (id: string, status: AppointmentStatus) =>
  api.put<Appointment>(`/appointments/${id}/status`, { status }).then((r) => r.data);
export const deleteAppointment = (id: string) =>
  api.delete(`/appointments/${id}`).then((r) => r.data);

// Queue / token
export const getQueue = (doctorId?: string) =>
  api.get<QueueState>('/queue', { params: { doctorId } }).then((r) => r.data);
export const callNext = (doctorId?: string) =>
  api.post<QueueState>('/queue/call-next', null, { params: { doctorId } }).then((r) => r.data);
export const skipQueue = (visitId: string, doctorId?: string) =>
  api.post<QueueState>(`/queue/${visitId}/skip`, null, { params: { doctorId } }).then((r) => r.data);
export const completeQueue = (visitId: string, doctorId?: string) =>
  api.post<QueueState>(`/queue/${visitId}/complete`, null, { params: { doctorId } }).then((r) => r.data);
export const requeueQueue = (visitId: string, doctorId?: string) =>
  api.post<QueueState>(`/queue/${visitId}/requeue`, null, { params: { doctorId } }).then((r) => r.data);

// Users & clinic
export const getDoctors = () => api.get<UserDto[]>('/users/doctors').then((r) => r.data);
export const getUsers = () => api.get<UserDto[]>('/users').then((r) => r.data);
export const createUser = (body: Record<string, unknown>) =>
  api.post<UserDto>('/users', body).then((r) => r.data);
export const getClinic = () => api.get<Clinic>('/clinic').then((r) => r.data);
export const updateClinic = (body: Record<string, unknown>) =>
  api.put<Clinic>('/clinic', body).then((r) => r.data);

// Expenses (Admin only)
export const getExpenses = (params: { from?: string; to?: string }) =>
  api.get<Expense[]>('/expenses', { params }).then((r) => r.data);
export const getExpenseSummary = (params: { from?: string; to?: string }) =>
  api.get<ExpenseSummary>('/expenses/summary', { params }).then((r) => r.data);
export const createExpense = (body: Record<string, unknown>) =>
  api.post<Expense>('/expenses', body).then((r) => r.data);
export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`).then((r) => r.data);

// ---- Patient portal auth ----
export const getPublicClinics = () =>
  api.get<PublicClinic[]>('/auth/clinics').then((r) => r.data);

export interface PatientRegisterBody {
  clinicId: string;
  name: string;
  mobileNumber: string;
  password: string;
  age: number;
  gender: string;
  villageTownCity?: string;
}
export const patientRegister = (body: PatientRegisterBody) =>
  api.post<AuthResponse>('/auth/patient/register', body).then((r) => r.data);
export const patientLogin = (mobileNumber: string, password: string) =>
  api.post<AuthResponse>('/auth/patient/login', { mobileNumber, password }).then((r) => r.data);

// ---- Patient portal (Patient role) ----
export const portalGetProfile = () =>
  api.get<PortalProfile>('/portal/me').then((r) => r.data);
export const portalGetDoctors = () =>
  api.get<PortalDoctor[]>('/portal/doctors').then((r) => r.data);
export const portalGetAppointments = () =>
  api.get<Appointment[]>('/portal/appointments').then((r) => r.data);

export interface BookAppointmentBody {
  doctorId?: string;
  scheduledDate: string;
  scheduledTime: string;
  reason?: string;
}
export const portalBookAppointment = (body: BookAppointmentBody) =>
  api.post<Appointment>('/portal/appointments', body).then((r) => r.data);
export const portalCancelAppointment = (id: string) =>
  api.put(`/portal/appointments/${id}/cancel`).then((r) => r.data);
export const portalGetVisits = () =>
  api.get<PortalVisit[]>('/portal/visits').then((r) => r.data);
export const portalGetNotifications = () =>
  api.get<NotificationsResponse>('/portal/notifications').then((r) => r.data);
