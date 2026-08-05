import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, Eye, EyeOff, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';

const ForgotPasswordPage = ({ mode, setMode }) => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep]           = useState(1); // 1: Send Email, 2: OTP & New PW
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);

  // Password Policy Matcher
  const pwChecks = useMemo(() => {
    const pw = newPassword;
    return {
      length: pw.length >= 8 && pw.length <= 64,
      upper:  /[A-Z]/.test(pw),
      lower:  /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)
    };
  }, [newPassword]);

  const allPwChecksPass = useMemo(() => {
    return Object.values(pwChecks).every(Boolean);
  }, [pwChecks]);

  const passwordsMatch = useMemo(() => {
    return confirmPw !== '' && newPassword === confirmPw;
  }, [newPassword, confirmPw]);

  // Step 1: Send Reset OTP
  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await forgotPassword(email);
      setSuccess('🔐 Password reset OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!allPwChecksPass || !passwordsMatch || otp.length !== 4) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('🎉 Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '46px',
    padding: '0 16px 0 42px',
    background: 'var(--color-surface)',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-sm)',
    outline: 'none'
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Reset Your Password' : 'Enter Reset OTP & New Password'}
      subtitle={step === 1 ? 'Enter your account email to receive a password reset OTP' : `Resetting password for ${email}`}
      mode={mode}
      setMode={setMode}
    >
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-danger)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> <span>{success}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ds-form-group">
            <label className="ds-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} rightIcon={!loading && <ArrowRight size={18} />}>
            {loading ? 'Sending Code…' : 'Send Password Reset Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* OTP Input */}
          <div className="ds-form-group">
            <label className="ds-label">4-Digit Reset OTP Code *</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                maxLength={4}
                required
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 4-digit OTP"
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold' }}
              />
            </div>
          </div>

          {/* New Password */}
          <div className="ds-form-group">
            <label className="ds-label">New Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPassword && !allPwChecksPass && (
              <div style={{ marginTop: 6, padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ color: pwChecks.length ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pwChecks.length ? '✓' : '✕'} 8-64 characters
                </div>
                <div style={{ color: pwChecks.upper ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pwChecks.upper ? '✓' : '✕'} One uppercase letter (A-Z)
                </div>
                <div style={{ color: pwChecks.lower ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pwChecks.lower ? '✓' : '✕'} One lowercase letter (a-z)
                </div>
                <div style={{ color: pwChecks.number ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pwChecks.number ? '✓' : '✕'} One number (0-9)
                </div>
                <div style={{ color: pwChecks.special ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pwChecks.special ? '✓' : '✕'} One special character
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="ds-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="ds-label" style={{ margin: 0 }}>Confirm New Password *</label>
              {confirmPw && (
                <span style={{ fontSize: '11px', color: passwordsMatch ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                  {passwordsMatch ? '✓ Passwords Match' : '✕ Passwords Do Not Match'}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                style={inputStyle}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={!allPwChecksPass || !passwordsMatch || otp.length !== 4 || loading} loading={loading}>
            {loading ? 'Updating Password…' : 'Update Password & Sign In'}
          </Button>
        </form>
      )}

      <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '16px' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
