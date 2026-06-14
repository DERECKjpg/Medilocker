import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doctorSignup, setAuthToken } from '../services/api';

const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Radiology', 'Surgery', 'Urology', 'Other',
];

export default function DoctorSignup() {
  const [form, setForm]       = useState({ name: '', email: '', mobile: '', specialization: '', qualification: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await doctorSignup({ ...form });
      const { access_token, doctor_id } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'doctor');
      localStorage.setItem('identifier', form.email);
      localStorage.setItem('doctorId', doctor_id);
      setAuthToken(access_token);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">Medi<span>Locker</span></div>
        <div className="tagline">Register as a doctor to issue digital prescriptions and manage patient health records.</div>
        <div className="features">
          {[
            { icon: '🩺', text: 'Verified doctor profile' },
            { icon: '💊', text: 'Issue & track prescriptions' },
            { icon: '🔔', text: 'Patient reminder notifications' },
            { icon: '🔒', text: 'Secure & ABHA-linked' },
          ].map((f) => (
            <div key={f.text} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box" style={{ maxWidth: 480 }}>
          <div className="role-badge doctor">👨‍⚕️ Doctor Portal</div>
          <h1>Doctor Registration</h1>
          <p className="auth-subtitle">Create your professional account on MediLocker.</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Full Name *</label>
                <input value={form.name} onChange={set('name')} placeholder="Dr. Aarti Verma" required />
              </div>
              <div className="input-group">
                <label>Mobile Number *</label>
                <input value={form.mobile} onChange={set('mobile')} placeholder="9999999999" required />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="doctor@example.com" required />
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>Specialization *</label>
                <select value={form.specialization} onChange={set('specialization')} required
                  style={{ width:'100%', padding:'13px 16px', borderRadius:18, border:'1.5px solid var(--border)', background:'#f8faff', outline:'none' }}>
                  <option value="">— Select —</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Qualification *</label>
                <input value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD" required />
              </div>
            </div>

            <div className="input-group">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Create a strong password" required />
            </div>

            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? 'Registering…' : 'Register as Doctor'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered? <Link to="/doctor/login">Sign in</Link>
            <br />
            <Link to="/" style={{ color: 'var(--muted)', marginTop: 8, display: 'inline-block' }}>← Back to portal selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
