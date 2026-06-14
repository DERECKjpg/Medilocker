import { useEffect, useState } from 'react';
import { createReminder, getMyReminders, deleteReminder, getDoctorUsers } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function PatientReminders() {
  const [reminders, setReminders]   = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [form, setForm]             = useState({ title: '', message: '', remind_at: '', doctor_id: '' });
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);

  async function load() {
    try {
      const [remRes, docRes] = await Promise.all([getMyReminders(), getDoctorUsers()]);
      setReminders(remRes.data || []);
      setDoctors(docRes.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { load(); }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.message.trim() || !form.remind_at) {
      setError('Title, message and date/time are required.');
      return;
    }

    setLoading(true);
    try {
      await createReminder({
        title: form.title.trim(),
        message: form.message.trim(),
        remind_at: form.remind_at,
        doctor_id: form.doctor_id ? Number(form.doctor_id) : null,
      });
      setSuccess(
        form.doctor_id
          ? 'Reminder created and doctor has been notified!'
          : 'Reminder created.'
      );
      setForm({ title: '', message: '', remind_at: '', doctor_id: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  function formatDate(dt) {
    if (!dt) return '';
    try { return new Date(dt).toLocaleString(); } catch { return dt; }
  }

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <h1>Reminders</h1>
        </div>

        {/* Create reminder form */}
        <div className="panel" style={{ marginBottom: 24 }}>
          <h2>Set a New Reminder</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Take medication" required />
              </div>
              <div className="input-group">
                <label>Reminder Date &amp; Time *</label>
                <input type="datetime-local" name="remind_at" value={form.remind_at} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={2}
                placeholder="Details about this reminder…"
                style={{ width: '100%', borderRadius: 16, border: '1px solid #d4dce6', padding: '12px 14px', background: '#f9fbff', resize: 'vertical' }}
                required
              />
            </div>
            <div className="input-group">
              <label>Notify Doctor (optional)</label>
              <select name="doctor_id" value={form.doctor_id} onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 16, border: '1px solid #d4dce6', background: '#f9fbff' }}>
                <option value="">— Select a doctor —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialization}
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                If selected, the doctor will receive an in-app notification.
              </small>
            </div>

            {error   && <p style={{ color: '#c0392b', marginBottom: 12 }}>{error}</p>}
            {success && <p style={{ color: '#1d6d3e', marginBottom: 12 }}>{success}</p>}

            <button type="submit" className="button button-primary" style={{ maxWidth: 220 }} disabled={loading}>
              {loading ? 'Saving…' : 'Create Reminder'}
            </button>
          </form>
        </div>

        {/* Reminder list */}
        <div className="panel">
          <h2>My Reminders</h2>
          {reminders.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No reminders set yet.</p>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className="file-card"
                style={{
                  marginBottom: 12,
                  borderLeft: r.is_notified ? '4px solid #1d6d3e' : '4px solid #e8eef5',
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{r.title}</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>{r.message}</p>
                  <small style={{ color: 'var(--muted)' }}>
                    {formatDate(r.remind_at)}
                    {r.doctor_id && (
                      <span style={{ marginLeft: 10, color: r.is_notified ? '#1d6d3e' : 'var(--muted)' }}>
                        {r.is_notified ? '✓ Doctor notified' : '⏳ Notification pending'}
                      </span>
                    )}
                  </small>
                </div>
                <button
                  className="button button-secondary"
                  style={{ whiteSpace: 'nowrap', width: 'auto', padding: '8px 14px', color: '#c0392b', borderColor: '#c0392b' }}
                  onClick={() => handleDelete(r.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
