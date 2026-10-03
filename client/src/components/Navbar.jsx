import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = user
    ? [
        ['/courses', 'Courses'],
        ['/dashboard', 'Dashboard'],
        ['/resume-builder', 'Resume Builder'],
        ['/certificates', 'Certificates'],
        ['/profile', 'Profile']
      ]
    : [['/courses', 'Courses']];

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <nav className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)' }}>
          Skill<span style={{ color: 'var(--color-primary)' }}>Hub</span>
        </Link>

        <div className="nav-links-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '.92rem' }}>{label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>}
              <span style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>☰</button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 780px) {
          .nav-links-desktop { display: none !important; }
          .hamburger { display: inline-block !important; }
        }
      `}</style>
    </header>
  );
}
