import React, { useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Bell, Info, AlertTriangle, ShieldCheck, Mail, Calendar, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose, notifications, onMarkAllRead, onMarkRead, onClearAll, onDelete }) => {
  const dropdownRef = useRef(null);
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

  const groupedNotifs = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const groups = { today: [], older: [] };
    
    if (Array.isArray(notifications)) {
      notifications.forEach(n => {
        const d = new Date(n.timestamp || n.createdAt);
        if (d >= today) {
          groups.today.push(n);
        } else {
          groups.older.push(n);
        }
      });
    }
    
    return groups;
  }, [notifications]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
      case 'bid_accepted':
      case 'rental_approved':
        return <ShieldCheck size={16} className="noti-icon noti-icon--success" />;
      case 'warning':
      case 'outbid':
        return <AlertTriangle size={16} className="noti-icon noti-icon--warning" />;
      case 'message':
        return <Mail size={16} className="noti-icon noti-icon--info" />;
      case 'scheme':
        return <Calendar size={16} className="noti-icon noti-icon--scheme" />;
      default:
        return <Info size={16} className="noti-icon noti-icon--default" />;
    }
  };

  const renderItem = (noti, index) => (
    <div 
      key={noti.id || noti._id} 
      className={`notification-dropdown__item ${!noti.isRead ? 'notification-dropdown__item--unread' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onMarkRead(noti.id || noti._id)}
    >
      <div className="notification-dropdown__item-icon">
        {getIcon(noti.type)}
      </div>
      <div className="notification-dropdown__item-content">
        <h4 className="notification-dropdown__item-title">{noti.title}</h4>
        <p className="notification-dropdown__item-msg">{noti.message}</p>
        <span className="notification-dropdown__item-time">
          {new Date(noti.timestamp || noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="notification-dropdown__item-actions">
        {!noti.isRead && <span className="notification-dropdown__unread-dot" />}
        <button 
          className="notification-dropdown__delete-btn" 
          onClick={(e) => { e.stopPropagation(); onDelete(noti.id || noti._id); }}
          title={t('notifications.deleteNotification')}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown__header">
        <div className="notification-dropdown__title">
          <Bell size={18} />
          <h3>{t('notifications.recentNotifications')}</h3>
        </div>
        <div className="notification-dropdown__header-actions">
          {notifications.some(n => !n.isRead) && (
            <button className="notification-dropdown__action-btn" onClick={onMarkAllRead} title={t('notifications.markAllRead')}>
              <Check size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notification-dropdown__action-btn" onClick={onClearAll} title={t('notifications.clearAll')}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="notification-dropdown__divider" />

      <div className="notification-dropdown__list">
        {notifications.length === 0 ? (
          <div className="notification-dropdown__empty">
            <Bell size={36} />
            <p>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <>
            {groupedNotifs.today.length > 0 && (
              <div className="notification-dropdown__section">
                <div className="notification-dropdown__section-title">{t('notifications.today')}</div>
                {groupedNotifs.today.map((noti, i) => renderItem(noti, i))}
              </div>
            )}
            {groupedNotifs.older.length > 0 && (
              <div className="notification-dropdown__section">
                <div className="notification-dropdown__section-title">{t('notifications.olderNotifications')}</div>
                {groupedNotifs.older.map((noti, i) => renderItem(noti, i + groupedNotifs.today.length))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
