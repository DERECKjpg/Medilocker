import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    icon: '🧑‍⚕️',
    iconBg: '#e3f5e9',
    label: 'Patient',
    desc: 'Access records, prescriptions & appointments',
    login: '/patient/login',
    signup: '/patient/signup',
  },
  {
    icon: '👨‍⚕️',
    iconBg: '#d7e8ff',
    label: 'Doctor',
    desc: 'Issue prescriptions & manage patient reminders',
    login: '/doctor/login',
    signup: '/doctor/signup',
  },
  {
    icon: '🏥',
    iconBg: '#fef9e7',
    label: 'Hospital',
    desc: 'Manage doctors, documents & appointments',
    login: '/hospital/login',
    signup: '/hospital/signup',
  },
];

export default function AuthSelection() {
  const navigate = useNavigate();

  return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      {/* Full-page centered layout */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f5fb 0%, #e6eef8 100%)',
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #005b96, #003f6e)',
              color: 'white', fontSize: '1.8rem', marginBottom: 14,
              boxShadow: '0 8px 24px rgba(0,91,150,0.3)',
            }}>
              🔒
            </div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Medi<span style={{ color: '#005b96' }}>Locker</span>
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '0.95rem' }}>
              Your secure digital health record platform
            </p>
          </div>

          {/* Role cards */}
          <div style={{ background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 20px 56px rgba(15,23,42,0.1)' }}>
            <p style={{ margin: '0 0 20px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Choose your portal
            </p>
            <div className="role-cards">
              {ROLES.map((r) => (
                <div key={r.label} className="role-card" onClick={() => navigate(r.login)}>
                  <div className="role-card-icon" style={{ background: r.iconBg }}>
                    {r.icon}
                  </div>
                  <div className="role-card-text" style={{ flex: 1 }}>
                    <strong>{r.label} Portal</strong>
                    <span>{r.desc}</span>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              ))}
            </div>

            <div className="auth-divider" style={{ marginTop: 24 }}>New to MediLocker?</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {ROLES.map((r) => (
                <button key={r.label}
                  onClick={() => navigate(r.signup)}
                  style={{
                    border: '1.5px solid var(--border)',
                    background: 'transparent', borderRadius: 12,
                    padding: '10px 8px', cursor: 'pointer', fontSize: '0.82rem',
                    color: 'var(--text)', fontWeight: 500,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='transparent'; }}
                >
                  {r.icon} {r.label} Signup
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
