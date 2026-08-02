import React, { useState, useEffect } from 'react';
import api, { auth } from '../utils/auth';
import { Lock, Bell, Moon, Shield, Trash2, Globe, Eye, Sun, User, LockKeyhole } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PremiumLanguageSelector from '../components/PremiumLanguageSelector';
import PremiumToggle from '../components/PremiumToggle';
import './Settings.css';

const Settings = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState(auth.getCurrentUser());
  const [profile, setProfile] = useState(null);
  
  // Toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [bidNotif, setBidNotif] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  
  // State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profiles/me');
      setProfile(res.data);
    } catch (err) {
      console.error('No profile created yet.');
    }
  };



  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/profiles/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully.');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This action is irreversible.')) {
      setLoading(true);
      try {
        await api.delete('/profiles');
        auth.logout();
        window.location.href = '/';
      } catch (err) {
        setError('Failed to delete account.');
        setLoading(false);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return; // Disable on mobile
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;
    
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
  };

  const renderCinematicTitle = (text) => {
    return text.split(' ').map((word, index) => (
      <span 
        key={index} 
        style={{ animationDelay: `${350 + (index * 80)}ms` }}
      >
        {word}
      </span>
    ));
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-bg__mesh" />
      <div className="settings-bg__aurora" />
      
      <div 
        className="settings-page"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 className="settings-title" style={{ marginBottom: 0 }}>
            {renderCinematicTitle(t('settings.title'))}
          </h1>
          <PremiumLanguageSelector />
        </div>

        {message && <div className="settings-alert settings-alert--success">{message}</div>}
        {error && <div className="settings-alert settings-alert--error">{error}</div>}

        <div className="settings-grid">
          {/* Left Card: General & Display */}
          <div className="settings-card" style={{ animationDelay: '1000ms' }}>
            <h2 className="settings-section-title">
              <Globe size={18} /> {t('settings.preferences.title')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              <PremiumToggle
                checked={emailNotif}
                onChange={setEmailNotif}
                label="Email Notifications"
                description="Receive updates via email"
                iconOn={<Bell size={12} />}
                iconOff={<Bell size={12} />}
              />
            </div>
          </div>

          {/* Right Card: Security & Password */}
          <div className="settings-card" style={{ animationDelay: '1100ms' }}>
            <h2 className="settings-section-title">
              <Lock size={18} /> {t('settings.security.title')}
            </h2>
            <form onSubmit={handleChangePassword}>
              <div className="settings-group">
                <label className="settings-label">{t('settings.security.currentPassword')}</label>
                <input 
                  type="password" 
                  value={passwordData.oldPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} 
                  required 
                  className="settings-input" 
                />
              </div>
              <div className="settings-group" style={{ marginTop: '12px' }}>
                <label className="settings-label">{t('settings.security.newPassword')}</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                  required 
                  className="settings-input" 
                />
              </div>
              <div className="settings-group" style={{ marginTop: '12px' }}>
                <label className="settings-label">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                  required 
                  className="settings-input" 
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '24px' }}>
                {t('settings.security.updateBtn')}
              </button>
            </form>
          </div>

          {/* Bottom Left Card: Notifications Options */}
          <div className="settings-card" style={{ animationDelay: '1200ms' }}>
            <h2 className="settings-section-title">
              <Bell size={18} /> {t('settings.preferences.notifications')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              <PremiumToggle
                checked={emailNotif}
                onChange={setEmailNotif}
                label="Send Bid/Outbid Email Alerts"
                description="Get emails for critical auction events"
                iconOn={<Bell size={12} />}
                iconOff={<Bell size={12} />}
              />
              <PremiumToggle
                checked={smsNotif}
                onChange={setSmsNotif}
                label="Receive Rental SMS Statuses"
                description="Get SMS alerts for equipment rentals"
              />
              <PremiumToggle
                checked={bidNotif}
                onChange={setBidNotif}
                label="Real-time In-App Popups"
                description="Get toast notifications in-app"
              />
            </div>
          </div>

          {/* Bottom Right Card: Privacy & Account deletion */}
          <div className="settings-card settings-card--danger" style={{ animationDelay: '1300ms' }}>
            <h2 className="settings-section-title" style={{ color: '#ef4444' }}>
              <Shield size={18} /> {t('settings.danger.title')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', marginTop: '16px' }}>
              <PremiumToggle
                checked={profilePublic}
                onChange={setProfilePublic}
                label={t('settings.preferences.privacy')}
                description={t('settings.preferences.privacyDesc')}
                iconOn={<Eye size={12} />}
                iconOff={<LockKeyhole size={12} />}
              />
            </div>
            <div style={{ borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '20px' }}>
              <p className="settings-danger-desc">
                {t('settings.danger.subtitle')}
              </p>
              <button 
                type="button" 
                onClick={handleDeleteAccount} 
                className="btn btn-primary" 
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white', gap: '8px' }}
              >
                <Trash2 size={16} /> Delete Account Permanent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
