import { useEffect, useState } from 'react';
import { getPatientDocuments } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function PatientDocuments() {
  const identifier = localStorage.getItem('identifier');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await getPatientDocuments(identifier);
        setDocuments(response.data.documents || []);
      } catch (error) {
        console.error(error);
      }
    }
    if (identifier) fetchDocuments();
  }, [identifier]);

  const grouped = documents.reduce((acc, doc) => {
    const key = doc.hospital_name || 'Unknown Hospital';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div className="page-shell">
      <Sidebar role="patient" />
      <main className="content">
        <div className="navbar">
          <h1>Documents</h1>
        </div>
        {Object.entries(grouped).map(([hospital, docs]) => (
          <div key={hospital} className="panel" style={{ marginBottom: 20 }}>
            <h2>{hospital}</h2>
            {docs.map((doc) => (
              <div key={doc.id} className="file-card">
                <div>
                  <div className="badge">{doc.document_type}</div>
                  <strong>{doc.file_name}</strong>
                  <p>{doc.upload_date}</p>
                </div>
                <a href={`http://localhost:8000/${doc.file_path}`} target="_blank" rel="noreferrer" className="button button-secondary">
                  View
                </a>
              </div>
            ))}
          </div>
        ))}
        {documents.length === 0 && <p>No documents found for this patient.</p>}
      </main>
    </div>
  );
}
