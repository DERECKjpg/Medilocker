import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../services/api';

export default function Sidebar({ role }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (role !== 'doctor') return;

    async function fetchUnread() {
      try {
        const res = await getUnreadCount();
        setUnread(res.data.unread_count || 0);
      } catch (_) {
        // ignore — token might not be set yet on first render
      }
    }

    fetchUnread();
    // Poll every 30 s so the badge stays fresh without websockets
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [role]);

  const items =
    role === 'hospital'
      ? [
          { label: 'Dashboard',    path: '/hospital/dashboard' },
          { label: 'Doctors',      path: '/hospital/doctors' },
          { label: 'Appointments', path: '/hospital/appointments' },
          { label: 'Patients',     path: '/hospital/patients' },
          { label: 'Documents',    path: '/hospital/documents' },
        ]
      : role === 'doctor'
      ? [
          { label: 'Dashboard',      path: '/doctor/dashboard' },
          { label: 'Prescriptions',  path: '/doctor/prescriptions' },
          { label: 'Notifications',  path: '/doctor/notifications', badge: unread },
          { label: 'Profile',        path: '/doctor/profile' },
        ]
      : [
          { label: 'Dashboard',       path: '/patient/dashboard' },
          { label: 'Medical History', path: '/patient/history' },
          { label: 'Documents',       path: '/patient/documents' },
          { label: 'Prescriptions',   path: '/patient/prescriptions' },
          { label: 'Appointments',    path: '/patient/appointments' },
          { label: 'Reminders',       path: '/patient/reminders' },
          { label: 'Profile',         path: '/patient/profile' },
        ];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('identifier');
    localStorage.removeItem('hospitalId');
    localStorage.removeItem('doctorId');
    const loginPath =
      role === 'hospital' ? '/hospital/login' :
      role === 'doctor'   ? '/doctor/login'   : '/patient/login';
    window.location.href = loginPath;
  };

  const portalLabel =
    role === 'hospital' ? 'Hospital Portal' :
    role === 'doctor'   ? 'Doctor Portal'   : 'Patient Portal';

  return (
    <aside className="sidebar">
      <div className="navbar" style={{ marginBottom: 24 }}>
        <div>
          <strong style={{ fontSize: '1.1rem' }}>MediLocker</strong>
          <p style={{ margin: '4px 0 0', color: '#5b6775', fontSize: '0.85rem' }}>{portalLabel}</p>
        </div>
      </div>
      <nav>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span style={{
                background: '#c0392b',
                color: 'white',
                borderRadius: 999,
                fontSize: '0.72rem',
                padding: '2px 7px',
                lineHeight: 1.4,
              }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <button className="button button-secondary" style={{ marginTop: '24px' }} onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
