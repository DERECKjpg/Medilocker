import { useEffect, useState } from 'react';
import { getAppointments } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function HospitalAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const response = await getAppointments();
        setAppointments(response.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadAppointments();
  }, []);

  return (
    <div className="page-shell">
      <Sidebar role="hospital" />
      <main className="content">
        <div className="navbar">
          <h1>Appointments</h1>
        </div>
        <div className="list-panel panel">
          <table>
            <thead>
              <tr>
                <th>Patient ABHA</th>
                <th>Doctor</th>
                <th>Hospital</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient_id}</td>
                  <td>{appointment.doctor_id}</td>
                  <td>{appointment.hospital_id}</td>
                  <td>{appointment.appointment_date}</td>
                  <td><span className="status-pill">{appointment.status}</span></td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="5">No appointments found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
