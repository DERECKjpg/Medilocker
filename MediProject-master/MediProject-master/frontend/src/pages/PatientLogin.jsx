import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientLogin, setAuthToken } from '../services/api';

export default function PatientLogin() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp]               = useState('123456');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await patientLogin({ identifier: identifier.trim(), otp });
      const { access_token, abha_id } = res.data;
      const canonicalId = abha_id || identifier.trim();
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'patient');
      localStorage.setItem('identifier', canonicalId);
      setAuthToken(access_token);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to login. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthLeft
        title="Welcome Back"
        subtitle="Access your complete medical history, prescriptions, and upcoming appointments — all in one place."
        features={[
          { icon: '📋', text: 'View prescriptions from doctors' },
          { icon: '📅', text: 'Track upcoming appointments' },
          { icon: '🔔', text: 'Set medication reminders' },
          { icon: '📁', text: 'Store all medical documents' },
        ]}
      />

      <div className="auth-right">
        <div className="auth-box">
          <div className="role-badge patient">🧑‍⚕️ Patient Portal</div>
          <h1>Patient Login</h1>
          <p className="auth-subtitle">Enter your ABHA ID or registered mobile number.</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label>ABHA ID or Mobile Number</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ABHA123456 or 9999999999"
                required
                autoFocus
              />
            </div>
            <div className="input-group">
              <label>
                OTP
                <span style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--muted)', background: '#f1f7ff', padding: '2px 8px', borderRadius: 6 }}>
                  Use 123456
                </span>
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
              />
            </div>
            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            New patient?{' '}
            <Link to="/patient/signup">Create an account</Link>
            <br />
            <Link to="/" style={{ color: 'var(--muted)', marginTop: 8, display: 'inline-block' }}>← Back to portal selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthLeft({ title, subtitle, features }) {
  return (
    <div className="auth-left">
      <div className="brand">Medi<span>Locker</span></div>
      <div className="tagline">{subtitle}</div>
      <div className="features">
        {features.map((f) => (
          <div key={f.text} className="feature-item">
            <div className="feature-icon">{f.icon}</div>
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
