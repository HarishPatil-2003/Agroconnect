import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import Avatar from '../ui/Avatar';
import ProfileDropdown from '../ProfileDropdown';
import NotificationDropdown from '../NotificationDropdown';
import DarkModeToggle from '../ui/DarkModeToggle';
import './Navbar.css';

const Navbar = ({ mode, setMode }) => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, clearAll, deleteNotification } = useNotification();

  const navigate = useNavigate();
  const { isAuthenticated, token, user, displayName, avatarUrl, logout, isBuyer } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Standard Main Links (Equipment hidden for Buyer role)
  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.marketplace'), to: '/bidding' },
    ...(!isBuyer ? [{ label: t('nav.equipment'), to: '/equipment' }] : []),
    { label: t('nav.guidance'), to: '/guidance' },
    { label: t('nav.about'), to: '/about' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="AgroConnect home">
            <div className="navbar__logo-icon">
              <Leaf size={20} strokeWidth={2.5} />
            </div>
            <span className="navbar__logo-text">AgroConnect</span>
          </Link>

          {/* Desktop Nav */}
          <ul className="navbar__links" role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="navbar__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar__actions">
            {/* Dark Mode Toggle */}
            <DarkModeToggle mode={mode} setMode={setMode} />

            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                  <button 
                    className={`navbar__noti-btn ${notificationsOpen ? 'navbar__noti-btn--active' : ''}`}
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileOpen(false);
                    }}
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="navbar__notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                  <NotificationDropdown 
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    notifications={notifications}
                    onMarkAllRead={markAllRead}
                    onMarkRead={markRead}
                    onClearAll={clearAll}
                    onDelete={deleteNotification}
                  />
                </div>

                {/* Profile Avatar (Single Source of Truth) */}
                <div style={{ position: 'relative' }}>
                  <button 
                    className="navbar__avatar-btn"
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotificationsOpen(false);
                    }}
                    aria-label="Open profile menu"
                    style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Avatar name={displayName} src={avatarUrl} size="sm" />
                  </button>
                  <ProfileDropdown 
                    isOpen={profileOpen} 
                    onClose={() => setProfileOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__link navbar__link--login">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary navbar__btn">
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${mobileOpen ? 'navbar__mobile--open' : ''}`} aria-hidden={!mobileOpen}>
        <ul role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link to={link.to} className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li className="navbar__mobile-divider" />
          {isAuthenticated ? (
            <>
              <li>
                <Link 
                  to={user?.role === 'farmer' ? '/farmer-dashboard' : user?.role === 'buyer' ? '/buyer-dashboard' : '/admin-dashboard'} 
                  className="navbar__mobile-link" 
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                  {t('nav.profile')}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                  {t('nav.settings')}
                </Link>
              </li>
              <li>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} 
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                >
                  {t('nav.logout')}
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>{t('nav.login')}</Link></li>
              <li><Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }} onClick={() => setMobileOpen(false)}>{t('nav.register')}</Link></li>
            </>
          )}
        </ul>
      </div>

      {/* Spacer */}
      <div style={{ height: 'var(--navbar-h)' }} />
    </>
  );
};

export default Navbar;
