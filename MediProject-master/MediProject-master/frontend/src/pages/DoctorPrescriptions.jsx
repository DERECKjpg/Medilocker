import { useEffect, useState } from 'react';
import { uploadPrescription, getDoctorPrescriptions, lookupPatient } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  // ── Patient lookup state ──────────────────────────────────────────────────
  const [abhaQuery, setAbhaQuery]     = useState('');
  const [lookingUp, setLookingUp]     = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookedUpPatient, setLookedUpPatient] = useState(null); // { id, name, abha_id }

  // ── Upload form state ─────────────────────────────────────────────────────
  const [form, setForm] = useState({
    notes: '',
    upload_date: new Date().toISOString().slice(0, 10),
  });
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError]   = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  async function load() {
    try {
      const res = await getDoctorPrescriptions();
      setPrescriptions(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Step 1: Lookup patient by ABHA ID ─────────────────────────────────────
  async function handleLookup(e) {
    e.preventDefault();
    setLookupError('');
    setLookedUpPatient(null);
    if (!abhaQuery.trim()) { setLookupError('Enter an ABHA ID.'); return; }

    setLookingUp(true);
    try {
      const res = await lookupPatient(abhaQuery.trim());
      setLookedUpPatient(res.data);
    } catch (err) {
      setLookupError(err.response?.data?.detail || 'Patient not found. They must register before you can issue a prescription.');
    } finally {
      setLookingUp(false);
    }
  }

  function handleClearPatient() {
    setLookedUpPatient(null);
    setAbhaQuery('');
    setLookupError('');
    setUploadError('');
    setUploadSuccess('');
    setFile(null);
    setForm({ notes: '', upload_date: new Date().toISOString().slice(0, 10) });
  }

  // ── Step 2: Upload prescription for confirmed patient ─────────────────────
  async function handleUpload(e) {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    if (!file)              { setUploadError('Please select a file.'); return; }
    if (!lookedUpPatient)   { setUploadError('Look up a patient first.'); return; }

    const data = new FormData();
    data.append('patient_id',   lookedUpPatient.abha_id);
    data.append('patient_name', lookedUpPatient.name);
    data.append('notes',        form.notes);
    data.append('upload_date',  form.upload_date);
    data.append('file',         file);

    setUploading(true);
    try {
      await uploadPrescription(data);
      setUploadSuccess(`Prescription uploaded for ${lookedUpPatient.name} (${lookedUpPatient.abha_id}).`);
      handleClearPatient();
      load();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page-shell">
      <Sidebar role="doctor" />
      <main className="content">
        <div className="navbar">
          <h1>Prescriptions</h1>
        </div>

        {/* ── Step 1: Find patient ─────────────────────────────────── */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <h2>Step 1 — Find Patient</h2>
          <p style={{ color: 'var(--muted)', marginTop: 0, marginBottom: 16, fontSize: '0.92rem' }}>
            Enter the patient's ABHA ID to verify they are registered before issuing a prescription.
          </p>

          {!lookedUpPatient ? (
            <form onSubmit={handleLookup} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                <label>Patient ABHA ID</label>
                <input
                  value={abhaQuery}
                  onChange={(e) => setAbhaQuery(e.target.value)}
                  placeholder="e.g. ABHA123456"
                />
              </div>
              <button type="submit" className="button button-primary"
                style={{ width: 'auto', padding: '12px 24px' }} disabled={lookingUp}>
                {lookingUp ? 'Searching…' : 'Find Patient'}
              </button>
            </form>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#e3f5e9', borderRadius: 16, padding: '14px 18px',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>✓ Patient Verified</div>
                <div style={{ marginTop: 4 }}>
                  <strong>{lookedUpPatient.name}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 12 }}>{lookedUpPatient.abha_id}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 12 }}>📞 {lookedUpPatient.mobile}</span>
                </div>
              </div>
              <button onClick={handleClearPatient} className="button button-secondary"
                style={{ width: 'auto', padding: '8px 16px', color: '#922b21', borderColor: '#922b21' }}>
                Change
              </button>
            </div>
          )}

          {lookupError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fdecea', borderRadius: 12, color: '#922b21', fontSize: '0.9rem' }}>
              {lookupError}
            </div>
          )}
        </div>

        {/* ── Step 2: Upload prescription (only shown after patient found) ── */}
        {lookedUpPatient && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <h2>Step 2 — Upload Prescription</h2>
            <form onSubmit={handleUpload}>
              <div className="input-group">
                <label>Notes / Diagnosis</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="Medications, dosage, instructions, diagnosis…"
                  style={{ width: '100%', borderRadius: 16, border: '1px solid #d4dce6', padding: '12px 14px', background: '#f9fbff', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label>Date *</label>
                  <input type="date" name="upload_date" value={form.upload_date}
                    onChange={(e) => setForm((p) => ({ ...p, upload_date: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>Prescription File (PDF / Image) *</label>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files[0])} required />
                </div>
              </div>

              {uploadError   && <p style={{ color: '#c0392b', marginBottom: 12 }}>{uploadError}</p>}
              {uploadSuccess && <p style={{ color: '#1d6d3e', marginBottom: 12 }}>{uploadSuccess}</p>}

              <button type="submit" className="button button-primary" style={{ maxWidth: 220 }} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload Prescription'}
              </button>
            </form>
          </div>
        )}

        {/* ── History ───────────────────────────────────────────────── */}
        <div className="panel">
          <h2>Issued Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No prescriptions issued yet.</p>
          ) : (
            prescriptions.map((p) => (
              <div key={p.id} className="file-card" style={{ marginBottom: 12 }}>
                <div>
                  <div className="badge">Prescription</div>
                  <strong style={{ display: 'block', marginTop: 6 }}>{p.file_name}</strong>
                  <small style={{ color: 'var(--muted)' }}>
                    For: {p.patient_name}
                    <span style={{ marginLeft: 8, background: '#f1f7ff', color: '#165291', padding: '2px 8px', borderRadius: 8, fontSize: '0.8rem' }}>
                      {p.patient_id}
                    </span>
                    <span style={{ marginLeft: 8 }}>· {p.upload_date}</span>
                  </small>
                  {p.notes && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--muted)' }}>{p.notes}</p>
                  )}
                </div>
                <a href={`http://localhost:8000/${p.file_path}`} target="_blank" rel="noreferrer"
                  className="button button-secondary" style={{ whiteSpace: 'nowrap' }}>
                  View
                </a>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
