import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../utils/auth';
import { NotificationService } from '../services/NotificationService';

// Set default timeout on raw Axios instances to avoid hanging
axios.defaults.timeout = 10000;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    } catch (e) {
      console.error('LocalStorage error in AuthContext token initialization:', e);
      return '';
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('LocalStorage error in AuthContext user initialization:', e);
      return null;
    }
  });

  const [profile, setProfile]         = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]         = useState(true);

  // Configure axios authorization header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Fetch current user & profile from single source of truth (MongoDB)
  const fetchAuthUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      if (userRes.data) {
        try {
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(userRes.data));
          } else if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('user', JSON.stringify(userRes.data));
          }
        } catch (storageErr) {
          console.warn('Storage write failed:', storageErr);
        }
      }

      try {
        const profileRes = await api.get('/profiles/me');
        setProfile(profileRes.data);
      } catch (profileErr) {
        setProfile(null);
      }

      try {
        const notifRes = await api.get('/notifications');
        if (Array.isArray(notifRes.data)) {
          setUnreadCount(notifRes.data.filter(n => !n.isRead).length);
        }
      } catch (notifErr) {
        // silent
      }
    } catch (err) {
      console.error('Failed to load authenticated user:', err);
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } catch (storageErr) {
        console.warn('Storage clear failed:', storageErr);
      }
      setToken('');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAuthUser();
  }, [fetchAuthUser]);

  // Login handler
  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    if (newToken) {
      try {
        if (rememberMe) {
          localStorage.setItem('token', newToken);
          if (userData) localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('token', newToken);
          if (userData) sessionStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (storageErr) {
        console.warn('Storage write failed on login:', storageErr);
      }
      setToken(newToken);
      setUser(userData);
      NotificationService.addNotification({
        title: 'Login Successful',
        message: 'Welcome back to AgroConnect!',
        type: 'success'
      });
      await fetchAuthUser();
    }
    return res.data;
  };

  // Register handler (returns verification payload)
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  // Verify OTP handler
  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { token: newToken, user: userData } = res.data;
    if (newToken) {
      try {
        localStorage.setItem('token', newToken);
        if (userData) localStorage.setItem('user', JSON.stringify(userData));
      } catch (storageErr) {
        console.warn('Storage write failed on OTP verification:', storageErr);
      }
      setToken(newToken);
      setUser(userData);
      NotificationService.addNotification({
        title: 'Registration Successful',
        message: 'Your account has been created and verified.',
        type: 'success'
      });
      await fetchAuthUser();
    }
    return res.data;
  };

  // Resend OTP handler
  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  // Forgot Password handler
  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  // Reset Password handler
  const resetPassword = async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    NotificationService.addNotification({
      title: 'Password Changed',
      message: 'Your password has been successfully reset.',
      type: 'success'
    });
    return res.data;
  };

  // Logout handler
  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } catch (storageErr) {
      console.warn('Storage clear failed on logout:', storageErr);
    }
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setUser(null);
    setProfile(null);
    setUnreadCount(0);
    NotificationService.addNotification({
      title: 'Logged Out',
      message: 'You have logged out successfully.',
      type: 'info'
    });
  };

  // Update profile handler
  const updateProfile = async (formData) => {
    const res = await api.post('/profiles', formData);
    setProfile(res.data);
    
    if (user) {
      const updatedUser = {
        ...user,
        name: res.data.fullName || user.name,
        profilePicture: res.data.profilePhoto || user.profilePicture
      };
      setUser(updatedUser);
    }
    
    NotificationService.addNotification({
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
      type: 'success'
    });
    
    return res.data;
  };

  const value = {
    token,
    user,
    profile,
    unreadCount,
    loading,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    refetchProfile: fetchAuthUser,
    isAuthenticated: !!token && !!user,
    isFarmer: user?.role === 'farmer',
    isBuyer:  user?.role === 'buyer',
    isAdmin:  user?.role === 'admin',
    avatarUrl: profile?.profilePhoto || user?.profilePicture || '',
    displayName: profile?.fullName || user?.name || 'User',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
