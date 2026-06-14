import { useEffect, useState } from 'react';
import { getDoctorNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await getDoctorNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page-shell">
      <Sidebar role="doctor" />
      <main className="content">
        <div className="navbar">
          <div>
            <h1>Notifications</h1>
            {unread > 0 && (
              <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
                {unread} unread notification{unread > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unread > 0 && (
            <button className="button button-secondary" style={{ width: 'auto', padding: '10px 18px' }} onClick={handleMarkAll}>
              Mark all as read
            </button>
          )}
        </div>

        {loading && <p>Loading…</p>}

        {!loading && notifications.length === 0 && (
          <div className="panel">
            <p style={{ color: 'var(--muted)' }}>No notifications yet. Patients will notify you when they set reminders.</p>
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className="file-card"
            style={{
              borderLeft: n.is_read ? '4px solid #e8eef5' : '4px solid var(--accent)',
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <strong>{n.title}</strong>
                {!n.is_read && (
                  <span style={{
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}>
                    New
                  </span>
                )}
              </div>
              <p style={{ margin: '6px 0 4px', fontSize: '0.95rem' }}>{n.message}</p>
              <small style={{ color: 'var(--muted)' }}>
                From: {n.patient_name} · {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
              </small>
            </div>
            {!n.is_read && (
              <button
                className="button button-secondary"
                style={{ whiteSpace: 'nowrap', width: 'auto', padding: '8px 14px' }}
                onClick={() => handleMarkRead(n.id)}
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
