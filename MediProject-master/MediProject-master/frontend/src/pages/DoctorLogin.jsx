import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doctorLogin, setAuthToken } from '../services/api';

export default function DoctorLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await doctorLogin({ identifier: identifier.trim(), password });
      const { access_token, doctor_id } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'doctor');
      localStorage.setItem('identifier', identifier.trim());
      localStorage.setItem('doctorId', doctor_id);
      setAuthToken(access_token);
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">Medi<span>Locker</span></div>
        <div className="tagline">The doctor portal lets you issue digital prescriptions and stay connected with your patients.</div>
        <div className="features">
          {[
            { icon: '💊', text: 'Issue digital prescriptions' },
            { icon: '🔔', text: 'Receive patient reminders' },
            { icon: '🔍', text: 'Look up registered patients' },
            { icon: '📊', text: 'Track prescription history' },
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
          <div className="role-badge doctor">👨‍⚕️ Doctor Portal</div>
          <h1>Doctor Login</h1>
          <p className="auth-subtitle">Sign in with your registered email or mobile number.</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label>Email or Mobile</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="doctor@example.com or 9999999999"
                required autoFocus
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            New doctor? <Link to="/doctor/signup">Register here</Link>
            <br />
            <Link to="/" style={{ color: 'var(--muted)', marginTop: 8, display: 'inline-block' }}>← Back to portal selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
