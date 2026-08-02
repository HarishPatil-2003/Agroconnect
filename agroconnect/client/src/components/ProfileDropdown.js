import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Settings, 
  HelpCircle, 
  LogOut, 
  MessageSquare, 
  Bell, 
  Heart, 
  Wrench, 
  Gavel,
  Shield,
  Users,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Avatar from './ui/Avatar';
import './ProfileDropdown.css';

const ProfileDropdown = ({ isOpen, onClose, onLogout }) => {
  const dropdownRef = useRef(null);
  const { user, profile, displayName, avatarUrl, isAdmin, isFarmer, isBuyer } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dashboardUrl = isFarmer 
    ? '/farmer-dashboard' 
    : isBuyer 
      ? '/buyer-dashboard' 
      : '/admin-dashboard';

  let menuItems = [
    { label: t('profileMenu.myDashboard'), to: dashboardUrl, icon: <LayoutDashboard size={16} /> },
    { label: t('profileMenu.myProfile'), to: '/profile', icon: <User size={16} /> },
    { label: t('profileMenu.equipment'), to: '/equipment', icon: <Wrench size={16} /> },
    { label: t('profileMenu.wishlist'), to: isBuyer ? '/buyer-dashboard?tab=wishlist' : '/bidding', icon: <Heart size={16} /> },
    { label: t('profileMenu.messages'), to: '/chat', icon: <MessageSquare size={16} /> },
    { label: t('profileMenu.notifications'), to: dashboardUrl, icon: <Bell size={16} /> },
    { label: t('profileMenu.settings'), to: '/settings', icon: <Settings size={16} /> },
  ];

  if (isFarmer) {
    menuItems.splice(2, 0, { label: t('profileMenu.myListings'), to: '/farmer-dashboard?tab=listings', icon: <FileText size={16} /> });
  }

  if (isBuyer) {
    menuItems.splice(2, 0, { label: t('profileMenu.myBids'), to: '/buyer-dashboard?tab=bids', icon: <Gavel size={16} /> });
  }

  if (isAdmin) {
    menuItems = [
      { label: t('profileMenu.adminPanel'), to: '/admin-dashboard', icon: <Shield size={16} /> },
      { label: t('profileMenu.userManagement'), to: '/admin-dashboard?tab=users', icon: <Users size={16} /> },
      { label: t('profileMenu.marketplaceManagement'), to: '/admin-dashboard?tab=products', icon: <FileText size={16} /> },
      { label: t('profileMenu.auctionManagement'), to: '/admin-dashboard?tab=auctions', icon: <Gavel size={16} /> },
      { label: t('profileMenu.reportsAnalytics'), to: '/admin-dashboard?tab=reports', icon: <BarChart2 size={16} /> },
      { label: t('profileMenu.myProfile'), to: '/profile', icon: <User size={16} /> },
      { label: t('profileMenu.settings'), to: '/settings', icon: <Settings size={16} /> },
    ];
  }

  return (
    <div className="profile-dropdown animate-fade-in" ref={dropdownRef}>
      <div className="profile-dropdown__header">
        <Avatar name={displayName} src={avatarUrl} size="md" />
        <div className="profile-dropdown__info" style={{ marginLeft: '12px' }}>
          <h4 className="profile-dropdown__name">{displayName}</h4>
          <p className="profile-dropdown__email">{profile?.email || user?.email || ''}</p>
          <span className="profile-dropdown__role">{user?.role || 'user'}</span>
        </div>
      </div>
      
      <div className="profile-dropdown__divider" />

      <ul className="profile-dropdown__menu">
        {menuItems.map((item, idx) => (
          <li key={idx}>
            <Link to={item.to} className="profile-dropdown__item" onClick={onClose}>
              <span className="profile-dropdown__icon">{item.icon}</span>
              <span className="profile-dropdown__label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="profile-dropdown__divider" />

      <button className="profile-dropdown__logout" onClick={() => { onLogout(); onClose(); }}>
        <LogOut size={16} />
        <span>{t('profileMenu.logout')}</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;
