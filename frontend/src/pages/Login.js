import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import DarkModeToggle from '../components/ui/DarkModeToggle';

/* ── Stagger delays for field reveals ────────────────────────── */
const FIELD_DELAYS = [700, 850, 1000, 1150, 1300];

const Login = ({ mode, setMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error,    setError]    = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || '');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [visible,  setVisible]  = useState([]);
  const [emailValid, setEmailValid] = useState(null); // null | true | false
  const rippleRef = useRef(null);

  /* Stagger-mount form fields sequentially */
  useEffect(() => {
    FIELD_DELAYS.forEach((delay, i) => {
      const t = setTimeout(() => {
        setVisible(prev => [...prev, i]);
      }, delay);
      return () => clearTimeout(t);
    });
  }, []);

  /* Email validation on blur */
  const handleEmailBlur = () => {
    if (!formData.email) { setEmailValid(null); return; }
    setEmailValid(/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(formData.email.trim()));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  /* Ripple on button click */
  const triggerRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;border-radius:50%;transform:scale(0);animation:ds-ripple 0.6s ease both;
      width:20px;height:20px;background:rgba(255,255,255,0.35);pointer-events:none;
      left:${e.clientX - rect.left - 10}px;top:${e.clientY - rect.top - 10}px;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerRipple(e);
    setLoading(true);
    setError('');

    const trimmedEmail = formData.email.trim();
    // Trim input
    setFormData(prev => ({ ...prev, email: trimmedEmail }));

    // Pre-submission validation
    if (!trimmedEmail) {
      setEmailValid(false);
      setError('Only Gmail addresses are allowed.');
      setLoading(false);
      return;
    }
    const isEmailValid = /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(trimmedEmail);
    if (!isEmailValid) {
      setEmailValid(false);
      setError('Only Gmail addresses are allowed.');
      setLoading(false);
      return;
    }

    try {
      const res = await login(trimmedEmail, formData.password, formData.rememberMe);
      const user = res.user || res;
      setSuccess(true);
      // Short success flash, then redirect
      await new Promise(r => setTimeout(r, 600));
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`, {
          state: { devOtp: err.response?.data?.devOtp }
        });
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* Determine input class for email (validation feedback) */
  const emailClass = [
    'auth-input',
    emailValid === true  ? 'auth-input--success' : '',
    emailValid === false ? 'auth-input--error'   : '',
    error               ? 'auth-input--error'   : '',
  ].filter(Boolean).join(' ');

  const passClass = [
    'auth-input',
    error ? 'auth-input--error' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your AgroConnect account"
        cardClassName="auth-card--login"
        mode={mode}
        setMode={setMode}
      >
      {/* ── Success Banner ── */}
      {successMsg && (
        <div className="auth-error-banner" style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d', borderColor: '#22c55e' }} role="alert">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      
      {/* ── Error Banner ── */}
      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="on">

        {/* ── Email ── */}
        <div
          className="auth-field-enter"
          style={{
            opacity: visible.includes(0) ? undefined : 0,
            animation: visible.includes(0) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label className="auth-label" htmlFor="login-email" style={{ margin: 0 }}>Email Address</label>
            {emailValid === false && (
              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>Only Gmail addresses are allowed.</span>
            )}
          </div>
          <div className="auth-input-wrap">
            <Mail
              size={16}
              className="auth-input-icon"
              aria-hidden="true"
            />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              placeholder="name@gmail.com"
              className={emailClass}
              aria-invalid={emailValid === false || !!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
            {emailValid === true && (
              <CheckCircle2
                size={16}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#22c55e',
                  animation: 'ds-scale-pop 0.4s var(--ease-spring) both',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* ── Password ── */}
        <div
          style={{
            opacity: visible.includes(1) ? undefined : 0,
            animation: visible.includes(1) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <label className="auth-label" htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <Lock
              size={16}
              className="auth-input-icon"
              aria-hidden="true"
            />
            <input
              id="login-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={passClass}
              aria-invalid={!!error}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw
                ? <EyeOff size={16} style={{ transition: 'transform 0.25s var(--ease-spring)', transform: 'rotate(10deg)' }} />
                : <Eye    size={16} style={{ transition: 'transform 0.25s var(--ease-spring)' }} />
              }
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Link to="/forgot-password" className="auth-forgot">Forgot Password?</Link>
          </div>
        </div>

        {/* ── Remember Me ── */}
        <div
          style={{
            opacity: visible.includes(2) ? undefined : 0,
            animation: visible.includes(2) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <label className="auth-remember">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me on this browser</span>
          </label>
        </div>

        {/* ── Submit Button ── */}
        <div
          style={{
            opacity: visible.includes(3) ? undefined : 0,
            animation: visible.includes(3) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <button
            type="submit"
            ref={rippleRef}
            disabled={loading || success}
            className="auth-submit-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: 'none',
              cursor: loading || success ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              color: '#fff',
              background: success
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                : 'linear-gradient(135deg, #1FA64B 0%, #16a34a 100%)',
              backgroundSize: '200% 200%',
              boxShadow: '0 4px 16px rgba(31,166,75,0.3)',
              animation: visible.includes(3) ? 'gradient-shift 4s ease-in-out 1s infinite' : 'none',
              transition: 'transform 0.3s var(--ease-spring), box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              if (!loading && !success) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(31,166,75,0.4), 0 0 0 1px rgba(34,197,94,0.15)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(31,166,75,0.3)';
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            aria-live="polite"
            aria-label={loading ? 'Signing in…' : success ? 'Signed in successfully' : 'Sign In'}
          >
            {success ? (
              <>
                <CheckCircle2 size={18} style={{ animation: 'ds-scale-pop 0.4s var(--ease-spring) both' }} />
                <span>Signed In!</span>
              </>
            ) : loading ? (
              <>
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: 'ds-spin 0.8s linear infinite' }}
                  aria-hidden="true"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Signing In…</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight
                  size={16}
                  style={{ transition: 'transform 0.3s var(--ease-spring)' }}
                  className="btn-arrow"
                />
              </>
            )}
          </button>
        </div>

        {/* ── Register link ── */}
        <div
          style={{
            opacity: visible.includes(4) ? undefined : 0,
            animation: visible.includes(4) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <p className="auth-register-link">
            Don't have an account?{' '}
            <Link to="/register">Create Free Account</Link>
          </p>
        </div>

      </form>
    </AuthLayout>
    </>
  );
};

export default Login;
