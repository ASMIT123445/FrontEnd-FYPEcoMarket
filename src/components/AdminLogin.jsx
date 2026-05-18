import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Invalid credentials'); return; }

      // Decode token to check is_staff
      const payload = JSON.parse(atob(data.access.split('.')[1]));
      if (!payload.is_staff) {
        setError('Access denied. Admin accounts only.');
        return;
      }

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      navigate('/admin-dashboard');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>🌿 Ecomarket</div>
        <h2 style={S.title}>Admin Login</h2>
        <p style={S.sub}>Sign in to access the admin panel</p>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={S.group}>
            <label style={S.label}>Username</label>
            <input
              style={S.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Admin username"
              required
            />
          </div>
          <div style={S.group}>
            <label style={S.label}>Password</label>
            <input
              type="password"
              style={S.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'white', borderRadius: '16px', padding: '40px', width: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  logo: { textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#2E7D32', marginBottom: '8px' },
  title: { textAlign: 'center', color: '#1B5E20', margin: '0 0 6px' },
  sub: { textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '24px' },
  error: { background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' },
  group: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 600, color: '#333', fontSize: '0.9rem' },
  input: { width: '100%', padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '6px' },
};
