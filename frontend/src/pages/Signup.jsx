import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api, { errorMessage, rememberEmail } from '../api';
import { useAuth } from '../context/AuthContext';
import { Alert, SegGroup, SegField, SegPassword, SubmitButton } from '../components/ui';
import AuthShell from '../components/AuthShell';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/api/auth/signup', { name, email, password });
      setMessage(res.data.message);
      rememberEmail(email);
      setTimeout(() => navigate('/verify', { state: { email } }), 1800);
    } catch (err) {
      setError(errorMessage(err, 'Failed to sign up. Please try again.'));
      setLoading(false);
    }
  };

  if (user) return <Navigate to="/" replace />;

  return (
    <AuthShell
      eyebrow="Sign up"
      title="Make your links count."
      subtitle="Create an account for unlimited short links and click counts on every one."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{message}</Alert>
      <form onSubmit={handleSignup} className="auth-form">
        <SegGroup>
          <SegField
            id="signup-name"
            label="Name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <SegField
            id="signup-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SegPassword
            id="signup-password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </SegGroup>
        <SubmitButton loading={loading} loadingText="Creating account" disabled={!!message}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
