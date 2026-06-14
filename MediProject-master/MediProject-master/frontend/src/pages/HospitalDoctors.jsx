import { useEffect, useState } from 'react';
import { addDoctor, getDoctors } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function HospitalDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDoctors() {
      try {
        const response = await getDoctors();
        setDoctors(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadDoctors();
  }, []);

  const hospitalId = localStorage.getItem('hospitalId');

  const handleAdd = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await addDoctor({
        hospital_id: Number(hospitalId || 0),
        doctor_name: doctorName,
        specialization,
        qualification,
        contact_number: contact,
      });
      setDoctorName('');
      setSpecialization('');
      setQualification('');
      setContact('');
      const response = await getDoctors();
      setDoctors(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to add doctor.');
    }
  };

  return (
    <div className="page-shell">
      <Sidebar role="hospital" />
      <main className="content">
        <div className="navbar">
          <h1>Doctors</h1>
        </div>

        <div className="panel">
          <h2>Add Doctor</h2>
          <form onSubmit={handleAdd}>
            <div className="input-group">
              <label>Doctor Name</label>
              <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Specialization</label>
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Qualification</label>
              <input value={qualification} onChange={(e) => setQualification(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Contact Number</label>
              <input value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <button type="submit" className="button button-primary">Add Doctor</button>
          </form>
        </div>

        <div className="list-panel panel" style={{ marginTop: 20 }}>
          <h2>Active Doctors</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.doctor_name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.qualification}</td>
                  <td>{doctor.contact_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
