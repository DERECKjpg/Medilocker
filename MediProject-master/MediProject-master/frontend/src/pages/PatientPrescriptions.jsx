import { useEffect, useState } from 'react';
import { getPatientPrescriptions } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function PatientPrescriptions() {
  const identifier = localStorage.getItem('identifier');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getPatientPrescriptions(identifier);
        setPrescriptions(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (identifier) load();
  }, [identifier]);

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <h1>Prescriptions</h1>
        </div>

        {loading && <p>Loading prescriptions…</p>}

        {!loading && prescriptions.length === 0 && (
          <div className="panel">
            <p style={{ color: 'var(--muted)' }}>No prescriptions have been uploaded for you yet.</p>
          </div>
        )}

        {prescriptions.map((p) => (
          <div key={p.id} className="file-card" style={{ marginBottom: 14 }}>
            <div>
              <div className="badge">Prescription</div>
              <strong style={{ display: 'block', marginTop: 6 }}>{p.file_name}</strong>
              <small style={{ color: 'var(--muted)' }}>
                Dr. {p.doctor_name} · {p.upload_date}
              </small>
              {p.notes && (
                <p style={{ margin: '6px 0 0', fontSize: '0.9rem', background: '#f1f7ff', padding: '8px 12px', borderRadius: 12 }}>
                  {p.notes}
                </p>
              )}
            </div>
            <a
              href={`http://localhost:8000/${p.file_path}`}
              target="_blank"
              rel="noreferrer"
              className="button button-secondary"
              style={{ whiteSpace: 'nowrap' }}
            >
              View / Download
            </a>
          </div>
        ))}
      </main>
    </div>
  );
}
