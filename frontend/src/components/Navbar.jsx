import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="hero-word-accent" style={{ fontSize: '1.25rem', letterSpacing: '0' }}>URL</span> 
          <span style={{ fontWeight: 600, color: 'var(--clr-text-primary)' }}>Shortener</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">{user.email}</span>
              <button onClick={logout} className="download-btn" style={{ height: '36px', padding: '0 16px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="footer-link">Login</Link>
              <Link to="/signup" className="shorten-btn" style={{ height: '36px', padding: '0 16px', fontSize: '14px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
