import { useEffect, useState } from 'react';
import { getPatientProfile, updatePatientProfile } from '../services/api';
import Sidebar from '../components/Sidebar';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientProfile() {
  // Seed from localStorage immediately so nothing shows "Loading…"
  const storedId = localStorage.getItem('identifier') || '';

  const [profile, setProfile] = useState({
    name: '',
    mobile: '',
    abha_id: storedId,   // ← pre-fill from localStorage right away
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    emergency_contact: '',
    created_at: '',
  });

  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getPatientProfile(storedId);
        setProfile(res.data);
        setForm({
          blood_group:        res.data.blood_group        || '',
          allergies:          res.data.allergies          || '',
          chronic_conditions: res.data.chronic_conditions || '',
          emergency_contact:  res.data.emergency_contact  || '',
        });
      } catch (err) {
        console.error(err);
      }
    }
    if (storedId) fetchProfile();
  }, [storedId]);

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await updatePatientProfile(form);
      setProfile((prev) => ({ ...prev, ...res.data }));
      setEditing(false);
      setSaveMsg('Health info updated successfully.');
    } catch (err) {
      setSaveMsg(err.response?.data?.detail || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <h1>Profile</h1>
        </div>

        {/* ── Account Details ─────────────────────────────────────────── */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ margin: 0 }}>Account Details</h2>
            {joinedDate && (
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>
                Member since {joinedDate}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px', marginTop: 18 }}>
            <ProfileRow label="Name"    value={profile.name}    />
            <ProfileRow label="Mobile"  value={profile.mobile}  />
            {/* ABHA ID is always available from localStorage, no "Loading…" */}
            <ProfileRow label="ABHA ID" value={profile.abha_id || storedId} highlight />
          </div>
        </div>

        {/* ── Health Information ──────────────────────────────────────── */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Health Information</h2>
            {!editing ? (
              <button
                className="button button-secondary"
                style={{ width: 'auto', padding: '8px 18px' }}
                onClick={() => { setEditing(true); setSaveMsg(''); }}
              >
                Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="button button-secondary"
                  style={{ width: 'auto', padding: '8px 18px' }}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="button button-primary"
                  style={{ width: 'auto', padding: '8px 18px' }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {saveMsg && (
            <p style={{ color: saveMsg.includes('success') ? '#1d6d3e' : '#c0392b', marginBottom: 12 }}>
              {saveMsg}
            </p>
          )}

          {!editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px' }}>
              <ProfileRow label="Blood Group"         value={profile.blood_group         || '—'} />
              <ProfileRow label="Emergency Contact"   value={profile.emergency_contact   || '—'} />
              <ProfileRow label="Allergies"           value={profile.allergies           || '—'} />
              <ProfileRow label="Chronic Conditions"  value={profile.chronic_conditions  || '—'} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="input-group">
                <label>Blood Group</label>
                <select name="blood_group" value={form.blood_group} onChange={handleFormChange}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 16, border: '1px solid #d4dce6', background: '#f9fbff' }}>
                  <option value="">— Select —</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Emergency Contact</label>
                <input name="emergency_contact" value={form.emergency_contact} onChange={handleFormChange}
                  placeholder="Name · Mobile" />
              </div>
              <div className="input-group">
                <label>Allergies</label>
                <input name="allergies" value={form.allergies} onChange={handleFormChange}
                  placeholder="e.g. Penicillin, Dust" />
              </div>
              <div className="input-group">
                <label>Chronic Conditions</label>
                <input name="chronic_conditions" value={form.chronic_conditions} onChange={handleFormChange}
                  placeholder="e.g. Diabetes, Hypertension" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileRow({ label, value, highlight }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
      <div style={{
        fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--accent)' : 'var(--text)',
        fontSize: highlight ? '1rem' : '0.95rem',
        letterSpacing: highlight ? '0.02em' : 'normal',
      }}>
        {value || '—'}
      </div>
    </div>
  );
}
