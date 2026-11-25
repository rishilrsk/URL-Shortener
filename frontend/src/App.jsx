import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

const AUTH_ROUTES = ['/login', '/signup', '/verify', '/reset-password'];

function App() {
  const { pathname } = useLocation();
  // Account pages use their own full-screen split layout.
  const isAuth = AUTH_ROUTES.includes(pathname);

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  if (isAuth) return routes;

  return (
    <div className="app">
      <Navbar />

      <main className="main">
        <div className="container">{routes}</div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Rishi</p>
          <nav className="footer-links" aria-label="Social links">
            <a href="https://github.com/rishilrsk" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/rishisivakesh/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;
