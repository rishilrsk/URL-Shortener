import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { errorMessage, recallEmail, rememberEmail } from '../api';
import { Alert, Spinner, SegGroup, SegField, SegCode, SubmitButton } from '../components/ui';
import AuthShell from '../components/AuthShell';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  // Fall back to the email saved during signup so a page refresh still works.
  const [email, setEmail] = useState(location.state?.email || recallEmail());
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/auth/verify', { email, otp });
      setSuccess(`${res.data.message} Taking you to log in…`);
      sessionStorage.removeItem('pendingEmail');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(errorMessage(err, 'Failed to verify the code. Please try again.'));
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
      const res = await api.post('/api/auth/resend-otp', { email, type: 'verification' });
      setSuccess(res.data.message);
    } catch (err) {
      setError(errorMessage(err, 'Could not send a new code. Please try again.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Verify email"
      title="Check your inbox."
      subtitle="We sent you a 6-digit code. It expires after 4 minutes."
    >
      <Alert tone="error">{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <form onSubmit={handleVerify} className="auth-form">
        <SegGroup>
          <SegField
            id="verify-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SegCode id="verify-code" value={otp} onChange={setOtp} />
        </SegGroup>
        <SubmitButton loading={loading} loadingText="Verifying" disabled={otp.length !== 6 || !email}>Verify email</SubmitButton>
        <button type="button" onClick={handleResend} className="btn btn-ghost btn-block" disabled={resending}>
          {resending ? <><Spinner /> Sending</> : 'Send a new code'}
        </button>
      </form>
    </AuthShell>
  );
}
