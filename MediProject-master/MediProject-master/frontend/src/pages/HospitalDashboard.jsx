import { useEffect, useState } from 'react';
import { getAppointments, getHospitalDocuments, getDoctors } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function HospitalDashboard() {
  const hospitalId = localStorage.getItem('hospitalId');
  const [doctorCount, setDoctorCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [doctorResp, apptResp, docResp] = await Promise.all([
          getDoctors(),
          getAppointments(),
          getHospitalDocuments(hospitalId),
        ]);
        setDoctorCount(doctorResp.data.length);
        setAppointmentsCount(apptResp.data.length);
        setDocumentCount(docResp.data.document_count || 0);
      } catch (error) {
        console.error(error);
      }
    }
    if (hospitalId) load();
  }, [hospitalId]);

  return (
    <div className="page-shell">
      <Sidebar role="hospital" />
      <main className="content">
        <div className="navbar">
          <div>
            <h1>Hospital Dashboard</h1>
            <p>Manage doctors, appointments, patients, and uploaded medical documents.</p>
          </div>
        </div>
        <div className="overview-grid">
          <div className="card">
            <strong>{doctorCount}</strong>
            <p>Doctors</p>
          </div>
          <div className="card">
            <strong>{appointmentsCount}</strong>
            <p>Appointments</p>
          </div>
          <div className="card">
            <strong>{documentCount}</strong>
            <p>Uploaded Documents</p>
          </div>
        </div>
      </main>
    </div>
  );
}
