import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Trash2, ShieldAlert, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/auth';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './Profile.css';

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isCompleteFlow = searchParams.get('complete') === 'true';

  const { user, profile, updateProfile, logout, refetchProfile } = useAuth();

  const [activeTab, setActiveTab]   = useState(isCompleteFlow ? 'edit' : 'view');
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', state: '', district: '', village: '', pincode: '',
    gender: 'Prefer not to say', dateOfBirth: '', role: 'farmer', bio: '', preferredLanguage: 'English',
    profilePhoto: '', farmSize: 0, primaryCrops: '', equipmentOwned: '', businessName: '', gstNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (profile || user) {
      setFormData({
        fullName: profile?.fullName || user?.name || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || user?.phone || '',
        address: profile?.address || user?.address || '',
        state: profile?.state || '',
        district: profile?.district || '',
        village: profile?.village || '',
        pincode: profile?.pincode || '',
        gender: profile?.gender || 'Prefer not to say',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        role: profile?.role || user?.role || 'farmer',
        bio: profile?.bio || '',
        preferredLanguage: profile?.preferredLanguage || 'English',
        profilePhoto: profile?.profilePhoto || user?.profilePicture || '',
        farmSize: profile?.farmSize || 0,
        primaryCrops: Array.isArray(profile?.primaryCrops) ? profile.primaryCrops.join(', ') : '',
        equipmentOwned: Array.isArray(profile?.equipmentOwned) ? profile.equipmentOwned.join(', ') : '',
        businessName: profile?.businessName || '',
        gstNumber: profile?.gstNumber || ''
      });
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => setFormData(prev => ({ ...prev, profilePhoto: '' }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await updateProfile(formData);
      setMessage('Profile saved successfully! Avatar and information synced globally.');
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await api.put('/profiles/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccountSubmit = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your account?')) {
      setSubmitting(true);
      try {
        await api.delete('/profiles');
        logout();
        navigate('/');
        window.location.reload();
      } catch (err) {
        setError('Failed to delete account.');
        setSubmitting(false);
      }
    }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Very subtle tilt (max 3 degrees)
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  const renderCinematicTitle = (text) => {
    return (
      <div className="profile-section-title-wrap">
        {text.split(' ').map((word, idx) => (
          <span key={idx} style={{ animationDelay: `${0.35 + idx * 0.15}s` }}>
            {word}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="profile-page-wrapper">
        <div className="profile-bg">
          <div className="profile-bg__mesh"></div>
          <div className="profile-bg__blob profile-bg__blob--1"></div>
          <div className="profile-bg__blob profile-bg__blob--2"></div>
        </div>
        <div className="ds-container" style={{ paddingTop: '24px', position: 'relative', zIndex: 2 }}>
        {isCompleteFlow && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', color: 'var(--color-info)', marginBottom: '24px', fontWeight: 600 }}>
            🎉 Welcome to AgroConnect! Please complete your profile configuration to access all features.
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', marginBottom: '24px', fontWeight: 600 }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', marginBottom: '24px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div 
          className="profile-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar-container">
              <Avatar
                name={formData.fullName || user?.name || 'User'}
                src={formData.profilePhoto}
                size="xl"
              />
              {activeTab === 'edit' && (
                <label className="profile-avatar-upload">
                  <Camera size={18} />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {formData.profilePhoto && activeTab === 'edit' && (
              <Button variant="ghost" size="sm" onClick={handleRemovePhoto} style={{ color: 'var(--color-danger)', marginTop: '8px' }}>
                <Trash2 size={14} /> Remove Photo
              </Button>
            )}

            <h3 className="profile-name">{formData.fullName || user?.name || 'User'}</h3>
            <Badge variant="primary" style={{ marginTop: '4px' }}>{formData.role || user?.role || 'User'}</Badge>

            <div className="profile-nav-tabs">
              <button className={`profile-nav-tab ${activeTab === 'view' ? 'profile-nav-tab--active' : ''}`} onClick={() => setActiveTab('view')}>
                <UserIcon size={16} /> View Profile
              </button>
              <button className={`profile-nav-tab ${activeTab === 'edit' ? 'profile-nav-tab--active' : ''}`} onClick={() => setActiveTab('edit')}>
                <UserIcon size={16} /> Edit Profile
              </button>
              <button className={`profile-nav-tab ${activeTab === 'password' ? 'profile-nav-tab--active' : ''}`} onClick={() => setActiveTab('password')}>
                <Lock size={16} /> Change Password
              </button>
              <button className={`profile-nav-tab ${activeTab === 'danger' ? 'profile-nav-tab--active' : ''}`} onClick={() => setActiveTab('danger')}>
                <ShieldAlert size={16} /> Danger Zone
              </button>
            </div>
          </div>

          {/* Main Panel */}
          <div className="profile-content">
            {/* VIEW TAB */}
            {activeTab === 'view' && (
              <div>
                {renderCinematicTitle("My Profile Details")}
                <div className="profile-form-grid profile-content-body">
                  <div className="profile-form-group">
                    <span className="profile-label">Full Name</span>
                    <div className="profile-info-display">{formData.fullName}</div>
                  </div>
                  <div className="profile-form-group">
                    <span className="profile-label">Email Address</span>
                    <div className="profile-info-display">{formData.email}</div>
                  </div>
                  <div className="profile-form-group">
                    <span className="profile-label">Phone Number</span>
                    <div className="profile-info-display">{formData.phone || 'N/A'}</div>
                  </div>
                  <div className="profile-form-group">
                    <span className="profile-label">State & Location</span>
                    <div className="profile-info-display">{formData.state ? `${formData.district}, ${formData.state}` : 'N/A'}</div>
                  </div>
                  <div className="profile-form-group profile-form-group--full">
                    <span className="profile-label">Bio</span>
                    <div className="profile-info-display">{formData.bio || 'No bio provided'}</div>
                  </div>
                </div>

                <Button variant="primary" onClick={() => setActiveTab('edit')} style={{ marginTop: '24px' }}>
                  Edit Profile
                </Button>
              </div>
            )}

            {/* EDIT TAB */}
            {activeTab === 'edit' && (
              <form onSubmit={handleSaveProfile}>
                {renderCinematicTitle("Edit Profile Information")}
                <div className="profile-form-grid profile-content-body">
                  <div className="profile-form-group">
                    <label className="profile-label">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Village</label>
                    <input type="text" name="village" value={formData.village} onChange={handleInputChange} className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">District</label>
                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="profile-input" />
                  </div>
                  <div className="profile-form-group profile-form-group--full">
                    <label className="profile-label">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="profile-textarea" rows={3} />
                  </div>
                </div>

                <div className="profile-actions" style={{ marginTop: '24px' }}>
                  <Button type="submit" variant="primary" loading={submitting}>
                    {submitting ? 'Saving…' : 'Save & Sync Profile'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setActiveTab('view')}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* PASSWORD TAB */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePasswordSubmit}>
                {renderCinematicTitle("Change Password")}
                <div className="profile-content-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                  <div className="profile-form-group">
                    <label className="profile-label">Old Password</label>
                    <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} required className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="profile-input" />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="profile-input" />
                  </div>
                  <Button type="submit" variant="primary" loading={submitting}>
                    {submitting ? 'Updating…' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <div className="settings-box danger-zone profile-content-body">
                {renderCinematicTitle("Danger Zone")}
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Permanently delete your AgroConnect account, listings, and data. This action cannot be undone.
                </p>
                <Button variant="danger" onClick={handleDeleteAccountSubmit}>
                  Delete My Account Permanently
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
  );
};

export default Profile;
