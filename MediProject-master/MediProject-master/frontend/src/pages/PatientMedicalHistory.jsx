import { useEffect, useState } from 'react';
import { getMedicalHistory } from '../services/api';
import Sidebar from '../components/Sidebar';

const EVENT_CONFIG = {
  prescription: { color: '#005b96', bg: '#d7e8ff', icon: '💊', label: 'Prescription' },
  document:     { color: '#1d6d3e', bg: '#e3f5e9', icon: '📄', label: 'Document'     },
  appointment:  { color: '#856404', bg: '#fef9e7', icon: '🏥', label: 'Appointment'  },
};

function statusStyle(status) {
  switch (status?.toLowerCase()) {
    case 'completed':  return { background: '#e3f5e9', color: '#1d6d3e' };
    case 'upcoming':   return { background: '#fef9e7', color: '#856404' };
    case 'cancelled':  return { background: '#fdecea', color: '#922b21' };
    default:           return { background: '#f1f7ff', color: '#165291' };
  }
}

export default function PatientMedicalHistory() {
  const identifier = localStorage.getItem('identifier');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // all | prescription | document | appointment

  useEffect(() => {
    async function load() {
      try {
        const res = await getMedicalHistory(identifier);
        setTimeline(res.data.timeline || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (identifier) load();
  }, [identifier]);

  const filtered = filter === 'all' ? timeline : timeline.filter((e) => e.event_type === filter);

  // Group by year-month for section headers
  const grouped = filtered.reduce((acc, event) => {
    const d = event.date || event.created_at || '';
    const key = d.slice(0, 7); // "YYYY-MM"
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function formatMonth(key) {
    if (!key) return '';
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
  }

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <h1>Medical History</h1>
        </div>

        {/* ── Summary cards ─────────────────────────────────────────── */}
        <div className="overview-grid" style={{ marginBottom: 24 }}>
          {Object.entries(EVENT_CONFIG).map(([type, cfg]) => {
            const count = timeline.filter((e) => e.event_type === type).length;
            return (
              <div key={type} className="card" style={{ background: cfg.bg, cursor: 'pointer', border: filter === type ? `2px solid ${cfg.color}` : '2px solid transparent' }}
                onClick={() => setFilter(filter === type ? 'all' : type)}>
                <strong style={{ fontSize: '1.5rem' }}>{cfg.icon} {count}</strong>
                <p>{cfg.label}s</p>
              </div>
            );
          })}
        </div>

        {/* ── Filter bar ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'prescription', 'document', 'appointment'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                border: 'none', borderRadius: 999, padding: '7px 18px', cursor: 'pointer',
                background: filter === f ? 'var(--accent)' : '#e8eef5',
                color: filter === f ? 'white' : 'var(--text)',
                fontWeight: filter === f ? 600 : 400,
                fontSize: '0.88rem',
              }}>
              {f === 'all' ? 'All Events' : EVENT_CONFIG[f].label + 's'}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: 'var(--muted)' }}>Loading your medical history…</p>}

        {!loading && filtered.length === 0 && (
          <div className="panel">
            <p style={{ color: 'var(--muted)' }}>No medical history events found{filter !== 'all' ? ` for ${filter}s` : ''}.</p>
          </div>
        )}

        {/* ── Timeline ─────────────────────────────────────────────── */}
        {sortedKeys.map((monthKey) => (
          <div key={monthKey} style={{ marginBottom: 28 }}>
            <div style={{
              fontWeight: 700, fontSize: '0.9rem', color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: 12, paddingLeft: 4,
            }}>
              {formatMonth(monthKey)}
            </div>

            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* vertical line */}
              <div style={{
                position: 'absolute', left: 10, top: 0, bottom: 0,
                width: 2, background: '#e8eef5', borderRadius: 2,
              }} />

              {grouped[monthKey].map((event, idx) => {
                const cfg = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.document;
                return (
                  <div key={`${event.event_type}-${event.id}-${idx}`} style={{ position: 'relative', marginBottom: 16 }}>
                    {/* dot */}
                    <div style={{
                      position: 'absolute', left: -24, top: 14,
                      width: 14, height: 14, borderRadius: 999,
                      background: cfg.color, border: '2px solid white',
                      boxShadow: '0 0 0 2px ' + cfg.color,
                    }} />

                    <div className="file-card" style={{ borderLeft: `3px solid ${cfg.color}`, marginBottom: 0 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            background: cfg.bg, color: cfg.color,
                            fontSize: '0.78rem', padding: '3px 10px', borderRadius: 999, fontWeight: 600,
                          }}>
                            {cfg.icon} {cfg.label}
                          </span>
                          {event.status && (
                            <span className="status-pill" style={{ ...statusStyle(event.status), fontSize: '0.78rem', padding: '3px 10px' }}>
                              {event.status}
                            </span>
                          )}
                          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{event.date}</span>
                        </div>

                        <strong style={{ display: 'block', marginTop: 6, fontSize: '0.97rem' }}>{event.title}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--muted)' }}>{event.description}</p>
                      </div>

                      {event.file_path && (
                        <a href={`http://localhost:8000/${event.file_path}`}
                          target="_blank" rel="noreferrer"
                          className="button button-secondary"
                          style={{ whiteSpace: 'nowrap', alignSelf: 'center' }}>
                          View File
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
