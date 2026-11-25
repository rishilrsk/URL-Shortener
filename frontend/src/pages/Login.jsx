import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage, rememberEmail } from '../api';
import { Alert, Field, Spinner, SegGroup, SegField, SegPassword, SubmitButton } from '../components/ui';
import AuthShell from '../components/AuthShell';

function ForgotPasswordDialog({ initialEmail, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !loading && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [loading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      rememberEmail(email);
      setSuccess(`${res.data.message} Taking you to the next step…`);
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1800);
    } catch (err) {
      setError(errorMessage(err, 'Could not send the code. Please try again.'));
      setLoading(false);
    }
  };

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
        <h2 id="forgot-title">Reset your password</h2>
        <p>We'll email you a 6-digit code to set a new password.</p>
        <Alert tone="error">{error}</Alert>
        <Alert tone="success">{success}</Alert>
        <form onSubmit={handleSubmit} className="form">
          <Field
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <div className="dialog-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !!success}>
              {loading ? <><Spinner /> Sending</> : 'Send code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.email, res.data.name);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'Failed to log in. Please try again.'));
      if (err.response?.data?.code === 'NOT_VERIFIED') {
        rememberEmail(email);
        setTimeout(() => navigate('/verify', { state: { email } }), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) return <Navigate to="/" replace />;

  return (
    <>
      <AuthShell
        eyebrow="Log in"
        title="Welcome back."
        subtitle="Pick up where you left off: your links and their click counts are waiting."
        footer={<>New here? <Link to="/signup">Create an account</Link></>}
      >
        <Alert tone="error">{error}</Alert>
        <form onSubmit={handleLogin} className="auth-form">
          <SegGroup>
            <SegField
              id="login-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SegPassword
              id="login-password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </SegGroup>
          <div className="auth-row">
            <button type="button" className="btn-link" onClick={() => setShowForgot(true)}>Forgot password?</button>
          </div>
          <SubmitButton loading={loading} loadingText="Logging in">Log in</SubmitButton>
        </form>
      </AuthShell>

      {showForgot && <ForgotPasswordDialog initialEmail={email} onClose={() => setShowForgot(false)} />}
    </>
  );
}
