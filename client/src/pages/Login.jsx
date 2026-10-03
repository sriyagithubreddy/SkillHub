import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('session') === 'expired' ? 'Your session expired. Please log in again.' : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required'); return; }

    setLoading(true);
    const result = await login(form);
    setLoading(false);

    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: '3rem 1.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Welcome back</h2>
        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 10, top: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        </form>

        <p style={{ fontSize: '.85rem', marginTop: '1rem', textAlign: 'center' }}>
          New to SkillHub? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
