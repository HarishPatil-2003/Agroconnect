// src/utils/auth.js

import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth utility functions
export const auth = {
  // Login user and store token + user info
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register user and store token + user info
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user and clear localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user object from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get raw token string
  getToken: () => localStorage.getItem('token'),

  // Check if user is authenticated
  isAuthenticated: () => !!localStorage.getItem('token'),
};

export default api;
