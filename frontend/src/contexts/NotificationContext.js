import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationService } from '../services/NotificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await NotificationService.getNotifications();
      setNotifications(data);
    };

    // Initial fetch
    fetchNotifications();

    const handleNewNotif = (e) => {
      setNotifications(prev => [e.detail, ...prev]);
    };

    const handleUpdate = (e) => {
      setNotifications(e.detail);
    };

    const handleRefresh = () => {
      fetchNotifications();
    };

    window.addEventListener('new-notification', handleNewNotif);
    window.addEventListener('notifications-updated', handleUpdate);
    window.addEventListener('notifications-refresh-requested', handleRefresh);

    return () => {
      window.removeEventListener('new-notification', handleNewNotif);
      window.removeEventListener('notifications-updated', handleUpdate);
      window.removeEventListener('notifications-refresh-requested', handleRefresh);
    };
  }, []);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification: NotificationService.addNotification,
      markAllRead: NotificationService.markAllRead,
      markRead: NotificationService.markRead,
      clearAll: NotificationService.clearAll,
      deleteNotification: NotificationService.deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: async () => {},
      markAllRead: async () => {},
      markRead: async () => {},
      clearAll: async () => {},
      deleteNotification: async () => {}
    };
  }
  return context;
};
