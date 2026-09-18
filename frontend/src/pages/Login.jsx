import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.trim();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      login(res.data.token, res.data.email);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.error.includes("verify")) {
          setTimeout(() => navigate('/verify', { state: { email } }), 2000);
        }
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email: forgotEmail });
      setForgotSuccess(res.data.message);
      setTimeout(() => {
        setShowForgotModal(false);
        navigate('/reset-password', { state: { email: forgotEmail } });
      }, 2000);
    } catch (err) {
      if (err.response?.status === 404) {
        setForgotError('Email not registered with us');
      } else if (err.response?.data?.error) {
        setForgotError(err.response.data.error);
      } else {
        setForgotError('Failed to process request.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
    <div className="card input-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Log in to manage your short links</p>

      {error && (
        <div className="error-banner" style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f87171" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="auth-form">
        <div>
          <label className="input-label">Email Address</label>
          <input 
            type="email" 
            className="url-input" 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ paddingLeft: '16px' }}
          />
        </div>
        <div>
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Password</span>
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)} 
              style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', fontSize: '12px' }}
            >
              Forgot password?
            </button>
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              className="url-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingLeft: '16px', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer', padding: '0', display: 'flex' }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="shorten-btn" disabled={loading} style={{ justifyContent: 'center', marginTop: '8px' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
        Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
      </p>
    </div>

    {showForgotModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div className="card input-card" style={{ maxWidth: '400px', width: '100%', margin: '20px' }}>
          <h2 className="auth-title" style={{ fontSize: '1.5rem' }}>Forgot Password</h2>
          <p className="auth-subtitle">Enter your registered email address</p>

          {forgotError && (
            <div className="error-banner" style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f87171" }}>
              {forgotError}
            </div>
          )}

          {forgotSuccess && (
            <div className="error-banner" style={{ backgroundColor: "var(--clr-success-bg)", color: "var(--clr-success)", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid rgba(52,211,153,0.3)" }}>
              {forgotSuccess} Redirecting...
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="auth-form">
            <div>
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="url-input" 
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={{ paddingLeft: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {forgotError === 'Email not registered with us' ? (
                <>
                  <button type="button" onClick={() => navigate('/signup')} className="shorten-btn" style={{ flex: 1, justifyContent: 'center' }}>Sign Up</button>
                  <button type="button" onClick={() => { setShowForgotModal(false); setForgotError(''); }} className="download-btn" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                </>
              ) : (
                <>
                  <button type="submit" className="shorten-btn" disabled={forgotLoading} style={{ flex: 1, justifyContent: 'center' }}>
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button type="button" onClick={() => setShowForgotModal(false)} className="download-btn" style={{ flex: 1, justifyContent: 'center' }} disabled={forgotLoading}>Cancel</button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
