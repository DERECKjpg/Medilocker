import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hospitalLogin, setAuthToken } from '../services/api';

export default function HospitalLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await hospitalLogin({ email, password });
      const { access_token, hospital_id } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'hospital');
      localStorage.setItem('hospitalId', hospital_id);
      setAuthToken(access_token);
      navigate('/hospital/dashboard');
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
        <div className="tagline">The hospital portal gives you full control over doctors, appointments, and patient health records.</div>
        <div className="features">
          {[
            { icon: '👩‍⚕️', text: 'Manage your doctor roster' },
            { icon: '📅', text: 'Schedule & track appointments' },
            { icon: '📄', text: 'Upload patient documents' },
            { icon: '🏥', text: 'Centralized patient records' },
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
          <h1>Hospital Login</h1>
          <p className="auth-subtitle">Sign in with your hospital's registered email.</p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hospital@example.com"
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
            New hospital? <Link to="/hospital/signup">Register here</Link>
            <br />
            <Link to="/" style={{ color: 'var(--muted)', marginTop: 8, display: 'inline-block' }}>← Back to portal selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
