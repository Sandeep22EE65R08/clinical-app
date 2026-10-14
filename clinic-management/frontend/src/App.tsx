import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Layout from './components/Layout';
import PatientLayout from './components/PatientLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import PortalHome from './pages/portal/PortalHome';
import PortalBook from './pages/portal/PortalBook';
import PortalAppointments from './pages/portal/PortalAppointments';
import PortalVisits from './pages/portal/PortalVisits';
import PortalNotifications from './pages/portal/PortalNotifications';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import Patients from './pages/Patients';
import PatientHistory from './pages/PatientHistory';
import TodayPatients from './pages/TodayPatients';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Appointments from './pages/Appointments';
import Queue from './pages/Queue';
import Settings from './pages/Settings';
import Receipt from './pages/Receipt';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portal/login" element={<PatientLogin />} />
          <Route path="/portal/register" element={<PatientRegister />} />
          <Route path="/portal" element={
            <ProtectedRoute portal><PatientLayout /></ProtectedRoute>}>
            <Route index element={<PortalHome />} />
            <Route path="book" element={<PortalBook />} />
            <Route path="appointments" element={<PortalAppointments />} />
            <Route path="visits" element={<PortalVisits />} />
            <Route path="notifications" element={<PortalNotifications />} />
          </Route>
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="add-patient" element={<AddPatient />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientHistory />} />
            <Route path="today" element={<TodayPatients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="queue" element={<Queue />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="receipt/:id" element={<Receipt />} />
            <Route path="analytics" element={
              <ProtectedRoute roles={['Admin', 'Doctor']}><Analytics /></ProtectedRoute>} />
            <Route path="expenses" element={
              <ProtectedRoute roles={['Admin']}><Expenses /></ProtectedRoute>} />
            <Route path="staff" element={
              <ProtectedRoute roles={['Admin']}><Staff /></ProtectedRoute>} />
            <Route path="settings" element={
              <ProtectedRoute roles={['Admin']}><Settings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
