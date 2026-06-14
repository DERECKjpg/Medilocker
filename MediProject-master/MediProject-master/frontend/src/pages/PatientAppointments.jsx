import { useEffect, useState } from 'react';
import { getPatientAppointments } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function PatientAppointments() {
  const identifier = localStorage.getItem('identifier');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await getPatientAppointments(identifier);
        setAppointments(response.data || []);
      } catch (error) {
        console.error(error);
      }
    }
    if (identifier) fetchAppointments();
  }, [identifier]);

  function statusColor(status) {
    switch (status?.toLowerCase()) {
      case 'upcoming':   return { background: '#fef9e7', color: '#856404' };
      case 'completed':  return { background: '#e3f5e9', color: '#1d6d3e' };
      case 'cancelled':  return { background: '#fdecea', color: '#922b21' };
      default:           return { background: '#f1f7ff', color: '#165291' };
    }
  }

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <h1>Appointments</h1>
        </div>
        <div className="list-panel panel">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Hospital</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctor_name || a.doctor_id}</td>
                  <td>{a.hospital_name || a.hospital_id}</td>
                  <td>{a.appointment_date}</td>
                  <td>
                    <span className="status-pill" style={statusColor(a.status)}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ color: 'var(--muted)' }}>No appointments scheduled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
