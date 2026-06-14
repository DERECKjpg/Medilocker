import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatientProfile, getPatientDocuments, getPatientAppointments, getPatientPrescriptions, getMyReminders } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function PatientDashboard() {
  const identifier = localStorage.getItem('identifier');
  const [profile, setProfile]             = useState(null);
  const [documents, setDocuments]         = useState([]);
  const [appointments, setAppointments]   = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders]         = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileResp, docsResp, apptResp, rxResp, remResp] = await Promise.all([
          getPatientProfile(identifier),
          getPatientDocuments(identifier),
          getPatientAppointments(identifier),
          getPatientPrescriptions(identifier),
          getMyReminders(),
        ]);
        setProfile(profileResp.data);
        setDocuments(docsResp.data.documents || []);
        setAppointments(apptResp.data || []);
        setPrescriptions(rxResp.data || []);
        setReminders(remResp.data || []);
      } catch (error) {
        console.error(error);
      }
    }
    if (identifier) fetchData();
  }, [identifier]);

  const upcoming  = appointments.filter((a) => a.status?.toLowerCase() === 'upcoming').length;
  const completed = appointments.filter((a) => a.status?.toLowerCase() === 'completed').length;

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <div>
            <h1>Patient Dashboard</h1>
            <p>Welcome back, {profile?.name || 'Patient'}.</p>
          </div>
        </div>

        <div className="overview-grid">
          <div className="card">
            <strong>{documents.length}</strong>
            <p>Medical Documents</p>
          </div>
          <div className="card">
            <strong>{prescriptions.length}</strong>
            <p>Prescriptions</p>
          </div>
          <div className="card">
            <strong>{upcoming}</strong>
            <p>Upcoming Appointments</p>
          </div>
          <div className="card">
            <strong>{reminders.length}</strong>
            <p>Active Reminders</p>
          </div>
        </div>

        {/* Recent prescriptions */}
        <div className="list-panel" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Recent Prescriptions</h2>
            <Link to="/patient/prescriptions" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>View all →</Link>
          </div>
          {prescriptions.slice(0, 3).map((p) => (
            <div key={p.id} className="file-card">
              <div>
                <div className="badge">Prescription</div>
                <strong style={{ display: 'block', marginTop: 6 }}>{p.file_name}</strong>
                <small style={{ color: 'var(--muted)' }}>Dr. {p.doctor_name} · {p.upload_date}</small>
                {p.notes && <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>{p.notes}</p>}
              </div>
              <a href={`http://localhost:8000/${p.file_path}`} target="_blank" rel="noreferrer" className="button button-secondary">
                View
              </a>
            </div>
          ))}
          {prescriptions.length === 0 && <p style={{ color: 'var(--muted)' }}>No prescriptions yet.</p>}
        </div>

        {/* Recent documents */}
        <div className="list-panel" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Recent Documents</h2>
            <Link to="/patient/documents" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>View all →</Link>
          </div>
          {documents.slice(0, 3).map((doc) => (
            <div key={doc.id} className="file-card">
              <div>
                <div className="badge">{doc.document_type}</div>
                <strong style={{ display: 'block', marginTop: 6 }}>{doc.file_name}</strong>
                <small style={{ color: 'var(--muted)' }}>{doc.hospital_name} · {doc.upload_date}</small>
              </div>
              <a href={`http://localhost:8000/${doc.file_path}`} target="_blank" rel="noreferrer" className="button button-secondary">
                View
              </a>
            </div>
          ))}
          {documents.length === 0 && <p style={{ color: 'var(--muted)' }}>No documents uploaded yet.</p>}
        </div>
      </main>
    </div>
  );
}
