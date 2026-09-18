import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.trim();

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      setMessage(res.data.message);
      setTimeout(() => navigate('/verify', { state: { email } }), 2000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card input-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join us to manage and track your links</p>

      {error && (
        <div className="error-banner" style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f87171" }}>
          {error}
        </div>
      )}
      
      {message && (
        <div className="error-banner" style={{ backgroundColor: "var(--clr-success-bg)", color: "var(--clr-success)", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid rgba(52,211,153,0.3)" }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSignup} className="auth-form">
        <div>
          <label className="input-label">User Name</label>
          <input 
            type="text" 
            className="url-input" 
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ paddingLeft: '16px' }}
          />
        </div>
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
          <label className="input-label">Password</label>
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
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
        Already have an account? <Link to="/login" className="auth-link">Log in</Link>
      </p>
    </div>
  );
}
