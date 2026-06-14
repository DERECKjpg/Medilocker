import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientSignup, setAuthToken } from '../services/api';

export default function PatientSignup() {
  const [form, setForm]       = useState({ name: '', mobile: '', abha_id: '', password: '', otp: '123456' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.abha_id.trim()) { setError('ABHA ID is required.'); return; }
    if (!form.mobile.trim())  { setError('Mobile number is required.'); return; }
    setLoading(true);
    try {
      const res = await patientSignup({ ...form, abha_id: form.abha_id.trim(), mobile: form.mobile.trim(), name: form.name.trim() });
      const { access_token, abha_id } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'patient');
      localStorage.setItem('identifier', abha_id || form.abha_id.trim());
      setAuthToken(access_token);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">Medi<span>Locker</span></div>
        <div className="tagline">Join thousands of patients managing their health records securely on MediLocker.</div>
        <div className="features">
          {[
            { icon: '🆔', text: 'Linked to your ABHA Health ID' },
            { icon: '💊', text: 'Receive digital prescriptions' },
            { icon: '🏥', text: 'Connect with hospitals & doctors' },
            { icon: '🔒', text: 'Secure end-to-end storage' },
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
          <div className="role-badge patient">🧑‍⚕️ Patient Portal</div>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Register to access your personal health locker.</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Full Name *</label>
                <input value={form.name} onChange={set('name')} placeholder="Sandesh Kumar" required />
              </div>
              <div className="input-group">
                <label>Mobile Number *</label>
                <input value={form.mobile} onChange={set('mobile')} placeholder="9999999999" required />
              </div>
            </div>

            <div className="input-group">
              <label>ABHA ID *</label>
              <input value={form.abha_id} onChange={set('abha_id')} placeholder="e.g. ABHA123456" required />
              <small>Your Ayushman Bharat Health Account ID. Doctors use this to send prescriptions.</small>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>Password <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>(optional)</span></label>
                <input type="password" value={form.password} onChange={set('password')} placeholder="Create a password" />
              </div>
              <div className="input-group">
                <label>OTP <span style={{ background: '#f1f7ff', color: '#165291', padding: '1px 7px', borderRadius: 6, fontSize: '0.75rem' }}>Use 123456</span></label>
                <input value={form.otp} onChange={set('otp')} required />
              </div>
            </div>

            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered? <Link to="/patient/login">Sign in</Link>
            <br />
            <Link to="/" style={{ color: 'var(--muted)', marginTop: 8, display: 'inline-block' }}>← Back to portal selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
