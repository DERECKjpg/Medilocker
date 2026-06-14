import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hospitalSignup, setAuthToken } from '../services/api';

export default function HospitalSignup() {
  const [form, setForm]       = useState({ hospital_name: '', address: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await hospitalSignup(form);
      const { access_token, hospital_id } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'hospital');
      localStorage.setItem('hospitalId', hospital_id);
      setAuthToken(access_token);
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to register hospital.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">Medi<span>Locker</span></div>
        <div className="tagline">Register your hospital on MediLocker and start managing patient records digitally.</div>
        <div className="features">
          {[
            { icon: '🏥', text: 'Verified hospital profile' },
            { icon: '👩‍⚕️', text: 'Add & manage doctors' },
            { icon: '📄', text: 'Upload patient documents' },
            { icon: '📅', text: 'Appointment management' },
          ].map((f) => (
            <div key={f.text} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="role-badge hospital">🏥 Hospital Portal</div>
          <h1>Register Hospital</h1>
          <p className="auth-subtitle">Create your hospital's account on MediLocker.</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Hospital Name *</label>
                <input value={form.hospital_name} onChange={set('hospital_name')} placeholder="Fortis Hospital" required />
              </div>
              <div className="input-group">
                <label>Mobile Number *</label>
                <input value={form.mobile} onChange={set('mobile')} placeholder="9999999999" required />
              </div>
            </div>

            <div className="input-group">
              <label>Address *</label>
              <input value={form.address} onChange={set('address')} placeholder="123, Main Street, Delhi, India" required />
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="admin@hospital.com" required />
            </div>

            <div className="input-group">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Create a strong password" required />
            </div>

            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? 'Registering…' : 'Register Hospital'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered? <Link to="/hospital/login">Sign in</Link>
            <br />
            <Link to="/" style={{ color: 'var(--muted)', marginTop: 8, display: 'inline-block' }}>← Back to portal selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
