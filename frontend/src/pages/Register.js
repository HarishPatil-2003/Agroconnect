import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import DarkModeToggle from '../components/ui/DarkModeToggle';
import { NotificationService } from '../services/NotificationService';

/* ── Stagger delays for Register fields ──────────────────────── */
const FIELD_DELAYS = [650, 780, 910, 1040, 1170];

const Register = ({ mode, setMode }) => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    address: '',
    agreeTerms: false
  });

  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [showPw, setShowPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [visible, setVisible]             = useState([]);
  const [emailValidState, setEmailValidState] = useState(null);
  const [phoneValidState, setPhoneValidState] = useState(null);

  /* Trigger sequential fade-in reveals */
  useEffect(() => {
    FIELD_DELAYS.forEach((delay, i) => {
      const t = setTimeout(() => {
        setVisible(prev => [...prev, i]);
      }, delay);
      return () => clearTimeout(t);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  /* Indian Phone Validation */
  const phoneValid = useMemo(() => {
    const clean = formData.phone.replace(/[^0-9]/g, '');
    // Normalize: strip leading country code '91' if user typed +91XXXXXXXXXX
    const normalized = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean;
    return /^[6-9]\d{9}$/.test(normalized);
  }, [formData.phone]);

  const handlePhoneBlur = () => {
    if (!formData.phone) { setPhoneValidState(null); return; }
    const clean = formData.phone.replace(/[^0-9]/g, '');
    const normalized = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean;
    setPhoneValidState(/^[6-9]\d{9}$/.test(normalized));
  };

  /* Email Validation */
  const emailValid = useMemo(() => {
    return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(formData.email.trim());
  }, [formData.email]);

  const handleEmailBlur = () => {
    if (!formData.email) { setEmailValidState(null); return; }
    setEmailValidState(/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(formData.email.trim()));
  };

  /* Password Requirements */
  const pwChecks = useMemo(() => {
    const pw = formData.password;
    return {
      length: pw.length >= 8 && pw.length <= 64,
      upper:  /[A-Z]/.test(pw),
      lower:  /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)
    };
  }, [formData.password]);

  const allPwChecksPass = useMemo(() => {
    return Object.values(pwChecks).every(Boolean);
  }, [pwChecks]);

  /* Live Password Strength */
  const pwStrength = useMemo(() => {
    if (!formData.password) return { label: 'None', score: 0, color: 'var(--color-border)' };
    const passedCount = Object.values(pwChecks).filter(Boolean).length;
    if (passedCount <= 1) return { label: 'Weak', score: 25, color: '#EF4444' };
    if (passedCount <= 3) return { label: 'Medium', score: 50, color: '#F59E0B' };
    if (passedCount === 4) return { label: 'Strong', score: 75, color: '#10B981' };
    return { label: 'Excellent', score: 100, color: '#059669' };
  }, [pwChecks, formData.password]);

  /* Confirm Password Match */
  const passwordsMatch = useMemo(() => {
    return formData.confirmPassword !== '' && formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  /* Form Validity Gate */
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== '' &&
      emailValid &&
      phoneValid &&
      allPwChecksPass &&
      passwordsMatch &&
      formData.agreeTerms
    );
  }, [formData.name, emailValid, phoneValid, allPwChecksPass, passwordsMatch, formData.agreeTerms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setEmailValidState(false);
      setError('Only Gmail addresses are allowed.');
      return;
    }
    const isEmailValid = /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(trimmedEmail);
    if (!isEmailValid) {
      setEmailValidState(false);
      setError('Only Gmail addresses are allowed.');
      return;
    }
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const res = await register({
        name: formData.name,
        email: trimmedEmail,
        phone: cleanPhone,
        password: formData.password,
        role: formData.role,
        address: formData.address
      });

      setSuccess(true);

      NotificationService.addNotification({
        title: 'Registration Successful',
        message: 'A 4-digit OTP has been sent to your email. Please verify your account.',
        type: 'success'
      });

      localStorage.setItem('hasRegisteredBefore', 'true');
      await new Promise(r => setTimeout(r, 600));
      // Navigate to OTP verification page so the user can enter the code
      navigate(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`, {
        replace: true,
        state: { devOtp: res.devOtp }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please verify your information.');
    } finally {
      setLoading(false);
    }
  };

  /* Input status helper classes */
  const inputClass = (validState) => [
    'auth-input',
    validState === true ? 'auth-input--success' : validState === false ? 'auth-input--error' : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      <AuthLayout
        title="Create Your Account"
        subtitle="Join AgroConnect — India's premier AgriTech ecosystem"
        cardClassName="auth-card--register"
        mode={mode}
        setMode={setMode}
      >
      {/* ── Error Banner ── */}
      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>

        {/* ── Row 1: Name | Mobile ── */}
        <div
          className="auth-2col"
          style={{
            opacity: visible.includes(0) ? undefined : 0,
            animation: visible.includes(0) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <div>
            <label className="auth-label" htmlFor="reg-name">Full Name *</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="your name"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="auth-label" htmlFor="reg-phone" style={{ margin: 0 }}>Indian Mobile *</label>
              {phoneValidState === false && (
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>Invalid</span>
              )}
            </div>
            <div className="auth-input-wrap">
              <Phone size={16} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                placeholder="+91 **********"
                className={inputClass(phoneValidState)}
                aria-invalid={phoneValidState === false}
              />
              {phoneValidState === true && (
                <CheckCircle2
                  size={14}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', zIndex: 2 }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Email | Role ── */}
        <div
          className="auth-2col"
          style={{
            opacity: visible.includes(1) ? undefined : 0,
            animation: visible.includes(1) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="auth-label" htmlFor="reg-email" style={{ margin: 0 }}>Email Address *</label>
              {emailValidState === false && (
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>Only Gmail addresses are allowed.</span>
              )}
            </div>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                placeholder="name@gmail.com"
                className={inputClass(emailValidState)}
                aria-invalid={emailValidState === false}
              />
              {emailValidState === true && (
                <CheckCircle2
                  size={14}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#22c55e', zIndex: 2 }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="reg-role">Account Role *</label>
            <div className="auth-input-wrap">
              <ShieldCheck size={16} className="auth-input-icon" aria-hidden="true" />
              <select
                id="reg-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="auth-input"
              >
                <option value="farmer">🌾 Farmer</option>
                <option value="buyer">🏬 Buyer</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Row 3: Password | Confirm ── */}
        <div
          className="auth-2col"
          style={{
            opacity: visible.includes(2) ? undefined : 0,
            animation: visible.includes(2) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <div>
            <label className="auth-label" htmlFor="reg-password">Password *</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-password"
                name="password"
                type={showPw ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create strong password"
                className="auth-input"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Live Strength Bar Only ( Checklist is tooltip/collapsed for 100vh constraint ) */}
            {formData.password && (
              <div style={{ marginTop: 6, position: 'relative' }} className="strength-bar-tooltip-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: pwStrength.color, marginBottom: 2 }}>
                  <span>Strength: {pwStrength.label}</span>
                </div>
                <div style={{ height: 4, background: 'var(--color-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pwStrength.score}%`, background: pwStrength.color, transition: 'all 200ms ease' }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="auth-label" htmlFor="reg-confirm-pw" style={{ margin: 0 }}>Confirm Password *</label>
              {formData.confirmPassword && !passwordsMatch && (
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>Mismatch</span>
              )}
            </div>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" aria-hidden="true" />
              <input
                id="reg-confirm-pw"
                name="confirmPassword"
                type={showConfirmPw ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={inputClass(formData.confirmPassword ? passwordsMatch : null)}
                aria-invalid={formData.confirmPassword ? !passwordsMatch : false}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Terms & Conditions ── */}
        <div
          style={{
            opacity: visible.includes(3) ? undefined : 0,
            animation: visible.includes(3) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <label className="auth-remember">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <span>I agree to the <span className="auth-terms-link">Terms & Conditions</span> and <span className="auth-terms-link">Privacy Policy</span></span>
          </label>
        </div>

        {/* ── Submit Button ── */}
        <div
          style={{
            opacity: visible.includes(4) ? undefined : 0,
            animation: visible.includes(4) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <button
            type="submit"
            disabled={!isFormValid || loading || success}
            className="auth-submit-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: 'none',
              cursor: !isFormValid || loading || success ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              color: '#fff',
              background: success
                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                : !isFormValid
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #1FA64B 0%, #16a34a 100%)',
              backgroundSize: '200% 200%',
              boxShadow: isFormValid ? '0 4px 16px rgba(31,166,75,0.3)' : 'none',
              transition: 'transform 0.3s var(--ease-spring), box-shadow 0.3s ease, background 0.3s ease',
            }}
            onMouseEnter={e => {
              if (isFormValid && !loading && !success) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(31,166,75,0.4), 0 0 0 1px rgba(34,197,94,0.15)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = isFormValid ? '0 4px 16px rgba(31,166,75,0.3)' : 'none';
            }}
            onMouseDown={e => { if (isFormValid) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            aria-live="polite"
          >
            {success ? (
              <>
                <CheckCircle2 size={18} style={{ animation: 'ds-scale-pop 0.4s var(--ease-spring) both' }} />
                <span>Account Created!</span>
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
                <span>Creating Account…</span>
              </>
            ) : (
              <>
                <span>Register & Verify</span>
                <ArrowRight
                  size={16}
                  style={{ transition: 'transform 0.3s var(--ease-spring)' }}
                  className="btn-arrow"
                />
              </>
            )}
          </button>
        </div>

        {/* ── Sign In Redirection ── */}
        <div
          style={{
            opacity: visible.includes(4) ? undefined : 0,
            animation: visible.includes(4) ? 'ds-fade-in-up 0.55s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <p className="auth-register-link">
            Already registered?{' '}
            <Link to="/login">Sign In Here</Link>
          </p>
        </div>

      </form>
    </AuthLayout>
    </>
  );
};

export default Register;
