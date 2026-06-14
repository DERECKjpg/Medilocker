import { useEffect, useState } from 'react';
import { getHospitalDocuments } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function HospitalDocuments() {
  const hospitalId = localStorage.getItem('hospitalId');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await getHospitalDocuments(hospitalId);
        setDocuments(response.data.documents || []);
      } catch (err) {
        console.error(err);
      }
    }
    if (hospitalId) loadDocuments();
  }, [hospitalId]);

  return (
    <div className="page-shell">
      <Sidebar role="hospital" />
      <main className="content">
        <div className="navbar">
          <h1>Uploaded Documents</h1>
        </div>
        {documents.length === 0 ? (
          <p>No documents uploaded by your hospital yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="file-card">
              <div>
                <div className="badge">{doc.document_type}</div>
                <strong>{doc.file_name}</strong>
                <p>{doc.patient_name}</p>
              </div>
              <a href={`http://localhost:8000/${doc.file_path}`} target="_blank" rel="noreferrer" className="button button-secondary">
                Preview
              </a>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
