import api from '../utils/auth';

let cachedNotifications = [];

export const NotificationService = {
  getNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data.map(n => ({ ...n, id: n._id || n.id }));
      cachedNotifications = data;
      return data;
    } catch (err) {
      console.error('Failed to get notifications:', err);
      return cachedNotifications;
    }
  },
  
  addNotification: async (notification) => {
    const tempId = 'temp-' + Date.now();
    const optimisticNotif = { id: tempId, timestamp: new Date().toISOString(), isRead: false, ...notification };
    
    // Optimistic UI dispatch
    cachedNotifications = [optimisticNotif, ...cachedNotifications];
    window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));

    try {
      const res = await api.post('/notifications', notification);
      const serverNotif = { ...res.data, id: res.data._id || res.data.id };
      
      // Reconcile with server result
      cachedNotifications = cachedNotifications.map(n => n.id === tempId ? serverNotif : n);
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));
      return serverNotif;
    } catch (err) {
      console.error('Failed to add notification (reverting):', err);
      // Rollback
      cachedNotifications = cachedNotifications.filter(n => n.id !== tempId);
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));
      return optimisticNotif;
    }
  },

  markAllRead: async () => {
    const previousState = [...cachedNotifications];
    // Optimistic update
    cachedNotifications = cachedNotifications.map(n => ({ ...n, isRead: true }));
    window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));

    try {
      await api.put('/notifications/read-all/all');
    } catch (err) {
      console.error('⚠️ [OPTIMISTIC ROLLBACK] Failed to mark all read, reverting:', err);
      // Rollback to previous state
      cachedNotifications = previousState;
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));
    }
  },

  markRead: async (id) => {
    const previousState = [...cachedNotifications];
    // Optimistic update
    cachedNotifications = cachedNotifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));

    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      console.error('⚠️ [OPTIMISTIC ROLLBACK] Failed to mark notification read, reverting:', err);
      // Rollback
      cachedNotifications = previousState;
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));
    }
  },

  clearAll: async () => {
    const previousState = [...cachedNotifications];
    // Optimistic update
    cachedNotifications = [];
    window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));

    try {
      await api.delete('/notifications/all/all');
    } catch (err) {
      console.error('⚠️ [OPTIMISTIC ROLLBACK] Failed to clear all notifications, reverting:', err);
      cachedNotifications = previousState;
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));
    }
  },

  deleteNotification: async (id) => {
    const previousState = [...cachedNotifications];
    // Optimistic update
    cachedNotifications = cachedNotifications.filter(n => n.id !== id);
    window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));

    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('⚠️ [OPTIMISTIC ROLLBACK] Failed to delete notification, reverting:', err);
      cachedNotifications = previousState;
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: cachedNotifications }));
    }
  }
};
