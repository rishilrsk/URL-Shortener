import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api, { errorMessage, recallEmail, rememberEmail } from '../api';
import { Alert, Spinner, SegGroup, SegField, SegCode, SegPassword, SubmitButton } from '../components/ui';
import AuthShell from '../components/AuthShell';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || recallEmail());
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/auth/reset-password', { email, otp, newPassword });
      setSuccess(`${res.data.message} Taking you to log in…`);
      sessionStorage.removeItem('pendingEmail');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(errorMessage(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setError('Please enter your email first.');
    setResending(true);
    setError('');
    setSuccess('');
    try {
      rememberEmail(email);
      const res = await api.post('/api/auth/resend-otp', { email, type: 'reset' });
      setSuccess(res.data.message);
    } catch (err) {
      setError(errorMessage(err, 'Could not send a new code. Please try again.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Set a new password."
      subtitle="Enter the 6-digit code we emailed you, then choose a new password."
      footer={<>Remembered it? <Link to="/login">Log in</Link></>}
    >
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <form onSubmit={handleReset} className="auth-form">
        <SegGroup>
          <SegField
            id="reset-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SegCode id="reset-code" value={otp} onChange={setOtp} />
          <SegPassword
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </SegGroup>
        <SubmitButton
          loading={loading}
          loadingText="Saving"
          disabled={otp.length !== 6 || newPassword.length < 8 || !email}
        >
          Save new password
        </SubmitButton>
        <button type="button" onClick={handleResend} className="btn btn-ghost btn-block" disabled={resending}>
          {resending ? <><Spinner /> Sending</> : 'Send a new code'}
        </button>
      </form>
    </AuthShell>
  );
}
