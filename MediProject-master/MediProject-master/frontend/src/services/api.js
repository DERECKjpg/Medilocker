import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const api = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

// Restore token on page load
setAuthToken(localStorage.getItem('token'));

// ── Auth ─────────────────────────────────────────────────────────────────────
export const patientSignup  = (payload) => api.post('/patient/signup', payload);
export const patientLogin   = (payload) => api.post('/patient/login', payload);
export const getPatientProfile = (identifier) => api.get(`/patient/profile/${identifier}`);
export const updatePatientProfile = (payload) => api.patch('/patient/profile/update', payload);
export const lookupPatient  = (abhaId) => api.get(`/patient/lookup/${abhaId}`);

export const doctorSignup   = (payload) => api.post('/doctor/signup', payload);
export const doctorLogin    = (payload) => api.post('/doctor/login', payload);
export const getDoctorProfile = (identifier) => api.get(`/doctor/profile/${identifier}`);

export const hospitalSignup = (payload) => api.post('/hospital/signup', payload);
export const hospitalLogin  = (payload) => api.post('/hospital/login', payload);

// ── Documents ────────────────────────────────────────────────────────────────
export const getPatientDocuments  = (identifier) => api.get(`/documents/patient/${identifier}`);
export const getHospitalDocuments = (hospitalId)  => api.get(`/documents/hospital/${hospitalId}`);
export const uploadDocument       = (form)        => api.post('/documents/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const uploadPrescription      = (form)        => api.post('/prescriptions/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getDoctorPrescriptions  = ()            => api.get('/prescriptions/doctor/mine');
export const getPatientPrescriptions = (patientId)   => api.get(`/prescriptions/patient/${patientId}`);
export const downloadPrescription    = (id)          => `${BASE_URL}/prescriptions/download/${id}`;

// ── Appointments ─────────────────────────────────────────────────────────────
export const getPatientAppointments = (identifier) => api.get(`/appointment/patient/${identifier}`);
export const getAppointments        = (hospitalId) =>
  api.get('/appointment/all', hospitalId ? { params: { hospital_id: hospitalId } } : undefined);
export const updateAppointment      = (id, payload) => api.put(`/appointment/update/${id}`, payload);
export const createAppointment      = (payload)    => api.post('/appointment/create', payload);

// ── Doctors ───────────────────────────────────────────────────────────────────
export const getDoctors      = (hospitalId) =>
  api.get('/doctor/all', hospitalId ? { params: { hospital_id: hospitalId } } : undefined);
export const getDoctorUsers  = ()           => api.get('/doctor/users/all');
export const addDoctor       = (payload)    => api.post('/doctor/add', payload);

// ── Reminders ────────────────────────────────────────────────────────────────
export const createReminder  = (payload) => api.post('/reminders/', payload);
export const getMyReminders  = ()        => api.get('/reminders/mine');
export const deleteReminder  = (id)      => api.delete(`/reminders/${id}`);

// ── Notifications ─────────────────────────────────────────────────────────────
export const getDoctorNotifications = ()   => api.get('/notifications/mine');
export const getUnreadCount         = ()   => api.get('/notifications/unread-count');
export const markNotificationRead   = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/mark-all-read');

// ── Medical History ───────────────────────────────────────────────────────────
export const getMedicalHistory = (patientId) => api.get(`/history/${patientId}`);
