import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PatientLogin         from './pages/PatientLogin';
import PatientSignup        from './pages/PatientSignup';
import PatientDashboard     from './pages/PatientDashboard';
import PatientDocuments     from './pages/PatientDocuments';
import PatientPrescriptions from './pages/PatientPrescriptions';
import PatientAppointments  from './pages/PatientAppointments';
import PatientReminders     from './pages/PatientReminders';
import PatientMedicalHistory from './pages/PatientMedicalHistory';
import PatientProfile       from './pages/PatientProfile';

import DoctorLogin          from './pages/DoctorLogin';
import DoctorSignup         from './pages/DoctorSignup';
import DoctorDashboard      from './pages/DoctorDashboard';
import DoctorPrescriptions  from './pages/DoctorPrescriptions';
import DoctorNotifications  from './pages/DoctorNotifications';
import DoctorProfile        from './pages/DoctorProfile';

import HospitalLogin        from './pages/HospitalLogin';
import HospitalSignup       from './pages/HospitalSignup';
import HospitalDashboard    from './pages/HospitalDashboard';
import HospitalDoctors      from './pages/HospitalDoctors';
import HospitalAppointments from './pages/HospitalAppointments';
import HospitalPatients     from './pages/HospitalPatients';
import HospitalDocuments    from './pages/HospitalDocuments';

import AuthSelection        from './pages/AuthSelection';
import PrivateRoute         from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<AuthSelection />} />
        <Route path="/patient/login"   element={<PatientLogin />} />
        <Route path="/patient/signup"  element={<PatientSignup />} />
        <Route path="/doctor/login"    element={<DoctorLogin />} />
        <Route path="/doctor/signup"   element={<DoctorSignup />} />
        <Route path="/hospital/login"  element={<HospitalLogin />} />
        <Route path="/hospital/signup" element={<HospitalSignup />} />

        {/* Patient */}
        <Route
          path="/patient/*"
          element={
            <PrivateRoute role="patient">
              <Routes>
                <Route path="dashboard"     element={<PatientDashboard />} />
                <Route path="history"       element={<PatientMedicalHistory />} />
                <Route path="documents"     element={<PatientDocuments />} />
                <Route path="prescriptions" element={<PatientPrescriptions />} />
                <Route path="appointments"  element={<PatientAppointments />} />
                <Route path="reminders"     element={<PatientReminders />} />
                <Route path="profile"       element={<PatientProfile />} />
                <Route path="*"             element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Doctor */}
        <Route
          path="/doctor/*"
          element={
            <PrivateRoute role="doctor">
              <Routes>
                <Route path="dashboard"     element={<DoctorDashboard />} />
                <Route path="prescriptions" element={<DoctorPrescriptions />} />
                <Route path="notifications" element={<DoctorNotifications />} />
                <Route path="profile"       element={<DoctorProfile />} />
                <Route path="*"             element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Hospital */}
        <Route
          path="/hospital/*"
          element={
            <PrivateRoute role="hospital">
              <Routes>
                <Route path="dashboard"    element={<HospitalDashboard />} />
                <Route path="doctors"      element={<HospitalDoctors />} />
                <Route path="appointments" element={<HospitalAppointments />} />
                <Route path="patients"     element={<HospitalPatients />} />
                <Route path="documents"    element={<HospitalDocuments />} />
                <Route path="*"            element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
