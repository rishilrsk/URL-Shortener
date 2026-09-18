import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.trim();

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify`, {
        email,
        otp,
      });

      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card input-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 className="auth-title">Verify Email</h2>
      <p className="auth-subtitle">We sent a 6-digit code to <strong style={{color: '#f0f0f8'}}>{email}</strong></p>

      {error && (
        <div className="error-banner" style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid #f87171" }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="error-banner" style={{ backgroundColor: "var(--clr-success-bg)", color: "var(--clr-success)", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", border: "1px solid rgba(52,211,153,0.3)" }}>
          {success} Redirecting to login...
        </div>
      )}

      <form onSubmit={handleVerify} className="auth-form">
        <div>
          <label className="input-label">Authentication Code</label>
          <input 
            type="text" 
            className="url-input" 
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            style={{ paddingLeft: '16px', letterSpacing: '8px', fontSize: '20px', textAlign: 'center' }}
          />
        </div>
        <button type="submit" className="shorten-btn" disabled={loading || otp.length !== 6} style={{ justifyContent: 'center', marginTop: '8px' }}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
    </div>
  );
}
