import { useEffect, useState } from 'react';
import { getDoctorProfile } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function DoctorProfile() {
  // identifier is whatever was typed at login (email or mobile)
  // We also have doctorId stored — use email as primary, fall back to mobile
  const identifier = localStorage.getItem('identifier') || '';
  const doctorId   = localStorage.getItem('doctorId');

  const [profile, setProfile] = useState(() => {
    // Pre-seed from localStorage so nothing shows "Loading…"
    return { name: '', email: identifier.includes('@') ? identifier : '', mobile: '', specialization: '', qualification: '' };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      // Try with whatever identifier we have
      const tryIds = [identifier].filter(Boolean);
      for (const id of tryIds) {
        try {
          const res = await getDoctorProfile(id);
          if (res.data) {
            setProfile(res.data);
            // Sync identifier to email for future calls
            if (res.data.email && localStorage.getItem('identifier') !== res.data.email) {
              localStorage.setItem('identifier', res.data.email);
            }
            setLoading(false);
            return;
          }
        } catch (_) { /* try next */ }
      }
      setLoading(false);
    }
    loadProfile();
  }, [identifier]);

  const joinedLabel = profile.specialization ? `${profile.specialization}` : 'Doctor';

  return (
    <div className="page-shell">
      <Sidebar role="doctor" />
      <main className="content">
        <div className="navbar">
          <h1>My Profile</h1>
        </div>

        {/* Avatar + name banner */}
        <div className="panel" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 700, flexShrink: 0,
          }}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
              {loading ? '—' : (profile.name || '—')}
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>{joinedLabel}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Account Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px' }}>
            <ProfileRow label="Full Name"       value={profile.name}           loading={loading} />
            <ProfileRow label="Email"           value={profile.email}          loading={loading} />
            <ProfileRow label="Mobile"          value={profile.mobile}         loading={loading} />
            <ProfileRow label="Specialization"  value={profile.specialization} loading={loading} />
            <ProfileRow label="Qualification"   value={profile.qualification}  loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileRow({ label, value, loading }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontWeight: 500, fontSize: '0.97rem' }}>
        {loading ? (
          <span style={{ display: 'inline-block', width: 120, height: 14, borderRadius: 6, background: '#e8eef5', animation: 'pulse 1.4s ease-in-out infinite' }} />
        ) : (
          value || '—'
        )}
      </div>
    </div>
  );
}
