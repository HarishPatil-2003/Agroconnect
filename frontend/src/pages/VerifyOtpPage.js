import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';

const VerifyOtpPage = ({ mode, setMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();

  const [email, setEmail]         = useState(searchParams.get('email') || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes countdown
  const [resendCooldown, setResendCooldown] = useState(0); // Instantly ready unless resend clicked
  const [devOtpHint, setDevOtpHint] = useState(location.state?.devOtp || '');

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Countdown Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cooldown = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cooldown);
  }, []);

  // Format Timer Format (mm:ss)
  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Input Digit Handling
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto Advance to Next Input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Backspace & Arrow Key Handling
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Paste OTP Support
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length === 4) {
      setOtpDigits(pastedData.split(''));
      inputRefs[3].current.focus();
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter all 4 digits of the OTP verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await verifyOtp(email, fullOtp);
      setSuccessMsg('🎉 Email verified successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        const user = res.user;
        if (user.role === 'farmer') navigate('/farmer-dashboard');
        else if (user.role === 'buyer') navigate('/buyer-dashboard');
        else if (user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/');
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Incorrect OTP code. Please try again.';
      setError(errMsg);
      if (errMsg.toLowerCase().includes('expired')) {
        setResendCooldown(0); // Unlock resend immediately if code expired
        setTimerSeconds(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendClick = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOtp(email);
      setSuccessMsg('A new 4-digit OTP code has been sent.');
      setResendCooldown(60);
      setTimerSeconds(300);
      setOtpDigits(['', '', '', '']);
      if (res.devOtp) setDevOtpHint(res.devOtp);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`Enter the 4-digit OTP code sent to ${email || 'your registered email'}`}
      mode={mode}
      setMode={setMode}
    >
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-danger)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> <span>{successMsg}</span>
        </div>
      )}

      {devOtpHint && (
        <div style={{
          background: 'rgba(31, 166, 75, 0.08)',
          border: '1.5px dashed var(--color-primary-600)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)'
        }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-700)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
            <Sparkles size={16} /> <span>[Development Mode / Demo OTP]</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            SMTP is not configured in <code>.env</code>. Your 4-digit verification code is:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <strong style={{ fontSize: '22px', letterSpacing: '4px', fontFamily: 'monospace', color: 'var(--color-primary-600)' }}>
              {devOtpHint}
            </strong>
            <button
              type="button"
              onClick={() => {
                const code = devOtpHint.toString();
                if (code.length === 4) setOtpDigits(code.split(''));
              }}
              style={{
                background: 'var(--color-primary-600)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Auto-fill Code
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleVerifySubmit} className="auth-form">
        {/* Email Address Edit Box if missing */}
        {!searchParams.get('email') && (
          <div className="ds-form-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>
        )}

        {/* 6 Individual Digit Inputs */}
        <div className="ds-form-group">
          <label className="auth-label" style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>
            4-Digit Verification OTP Code
          </label>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }} onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                style={{
                  width: '44px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  borderRadius: '24px', // OTP Boxes: 24px
                  border: '2px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary-600)',
                  outline: 'none',
                  boxShadow: digit ? '0 0 0 3px rgba(31,166,75,0.15)' : 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Expiry Timer */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <span>Code expires in: </span>
          <strong style={{ color: timerSeconds < 60 ? 'var(--color-danger)' : 'var(--color-primary-600)' }}>
            {formatTime(timerSeconds)}
          </strong>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={otpDigits.join('').length !== 4 || loading}
          className="auth-submit-btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            border: 'none',
            cursor: otpDigits.join('').length !== 4 || loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
            color: '#fff',
            background: loading
              ? '#cbd5e1'
              : 'linear-gradient(135deg, #1FA64B 0%, #16a34a 100%)',
            boxShadow: otpDigits.join('').length === 4 ? '0 4px 16px rgba(31,166,75,0.3)' : 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => {
            if (otpDigits.join('').length === 4 && !loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(31,166,75,0.4)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = otpDigits.join('').length === 4 ? '0 4px 16px rgba(31,166,75,0.3)' : 'none';
          }}
        >
          {loading ? (
            <>
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: 'ds-spin 0.8s linear infinite' }}
                aria-hidden="true"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span>Verifying Code…</span>
            </>
          ) : (
            <>
              <span>Verify & Activate Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Resend Action */}
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <button
            type="button"
            onClick={handleResendClick}
            disabled={resendCooldown > 0 || resending}
            style={{
              background: 'none',
              border: 'none',
              color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-primary-600)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} className={resending ? 'spin' : ''} />
            <span>
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
            </span>
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Need to change email?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>
            Back to Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
