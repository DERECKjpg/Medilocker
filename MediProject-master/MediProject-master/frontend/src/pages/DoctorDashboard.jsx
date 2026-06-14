import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorProfile, getDoctorPrescriptions, getDoctorNotifications } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function DoctorDashboard() {
  const identifier = localStorage.getItem('identifier') || '';
  const [profile, setProfile] = useState({
    name: '', email: identifier.includes('@') ? identifier : '',
    specialization: '', qualification: '',
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, rxRes, notifRes] = await Promise.all([
          getDoctorProfile(identifier),
          getDoctorPrescriptions(),
          getDoctorNotifications(),
        ]);
        if (profileRes.data) {
          setProfile(profileRes.data);
          // Keep identifier in sync with email
          if (profileRes.data.email) localStorage.setItem('identifier', profileRes.data.email);
        }
        setPrescriptions(rxRes.data || []);
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    if (identifier) load();
  }, [identifier]);

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page-shell">
      <Sidebar role="doctor" />
      <main className="content">
        <div className="navbar">
          <div>
            <h1>Doctor Dashboard</h1>
            <p>Welcome back, {profile?.name || 'Doctor'}.</p>
          </div>
        </div>

        <div className="overview-grid">
          <div className="card">
            <strong>{prescriptions.length}</strong>
            <p>Prescriptions Issued</p>
          </div>
          <div className="card" style={{ position: 'relative' }}>
            <strong>{notifications.length}</strong>
            <p>Patient Notifications</p>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 14, right: 14,
                background: '#c0392b', color: 'white',
                borderRadius: 999, fontSize: '0.75rem', padding: '2px 8px',
              }}>
                {unread} new
              </span>
            )}
          </div>
          <div className="card">
            <strong>{profile?.specialization || '—'}</strong>
            <p>Specialization</p>
          </div>
        </div>

        {/* Recent notifications */}
        {notifications.filter((n) => !n.is_read).length > 0 && (
          <div className="list-panel" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Unread Patient Reminders</h2>
              <Link to="/doctor/notifications" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>View all →</Link>
            </div>
            {notifications.filter((n) => !n.is_read).slice(0, 3).map((n) => (
              <div key={n.id} className="file-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div>
                  <strong>{n.title}</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>{n.message}</p>
                  <small style={{ color: 'var(--muted)' }}>
                    From: {n.patient_name} · {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent prescriptions */}
        <div className="list-panel" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Recent Prescriptions</h2>
            <Link to="/doctor/prescriptions" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Upload new →</Link>
          </div>
          {prescriptions.slice(0, 5).map((p) => (
            <div key={p.id} className="file-card">
              <div>
                <div className="badge">Prescription</div>
                <strong style={{ display: 'block', marginTop: 6 }}>{p.file_name}</strong>
                <small style={{ color: 'var(--muted)' }}>
                  For: {p.patient_name} ({p.patient_id}) · {p.upload_date}
                </small>
              </div>
              <a href={`http://localhost:8000/${p.file_path}`} target="_blank" rel="noreferrer" className="button button-secondary">
                View
              </a>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>No prescriptions issued yet. <Link to="/doctor/prescriptions">Upload one now.</Link></p>
          )}
        </div>
      </main>
    </div>
  );
}
