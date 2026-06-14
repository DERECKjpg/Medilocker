import { useEffect, useState } from 'react';
import { getAppointments } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function HospitalPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await getAppointments();
        const patientData = response.data.map((item) => ({
          patient_id: item.patient_id,
          doctor_id: item.doctor_id,
          date: item.appointment_date,
          status: item.status,
        }));
        setPatients(patientData);
      } catch (err) {
        console.error(err);
      }
    }
    loadPatients();
  }, []);

  return (
    <div className="page-shell">
      <Sidebar role="hospital" />
      <main className="content">
        <div className="navbar">
          <h1>Today&apos;s Patients</h1>
        </div>
        <div className="overview-grid">
          {patients.slice(0, 6).map((patient) => (
            <div key={`${patient.patient_id}-${patient.date}`} className="card">
              <strong>{patient.patient_id}</strong>
              <p>Doctor: {patient.doctor_id || 'N/A'}</p>
              <p>Date: {patient.date}</p>
              <span className="badge">{patient.status}</span>
            </div>
          ))}
          {patients.length === 0 && <p>No patient visits scheduled today.</p>}
        </div>
      </main>
    </div>
  );
}
