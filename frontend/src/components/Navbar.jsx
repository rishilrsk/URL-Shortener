import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand" aria-label="URL Shortener home">
          <img src="/URL-Shortener-logo.png" alt="URL Shortener" className="brand-logo" width="510" height="144" />
        </Link>

        <nav className="nav" aria-label="Account">
          {user ? (
            <>
              <span className="nav-user" title={user.email}>{user.name || user.email}</span>
              <button type="button" onClick={logout} className="btn btn-on-dark btn-sm">Log out</button>
            </>
          ) : (
            <>
              {pathname !== '/login' && <Link to="/login" className="btn btn-ghost-dark btn-sm">Log in</Link>}
              {pathname !== '/signup' && <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
