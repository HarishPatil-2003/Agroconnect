import axios from "axios";

// Centralized API Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Cleaned base URL for requests (ensures `/api` is included consistently)
const cleanedBaseURL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

if (import.meta.env.DEV) {
  console.log(`🔌 [DEVELOPMENT] API Base URL configured: ${cleanedBaseURL}`);
}

// Axios instance using config/proxy (backend on 5001)
const api = axios.create({
  baseURL: cleanedBaseURL,
  timeout: 10000, // 10 seconds timeout limit
  withCredentials: true, // Crucial for sending/receiving HTTP-Only cookies cross-origin
});


// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth helper methods
export const auth = {
  // Register user (Triggers OTP email)
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const res = await api.post("/auth/resend-otp", { email });
    return res.data;
  },

  // Login user
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  // Reset Password
  resetPassword: async (email, otp, newPassword) => {
    const res = await api.post("/auth/reset-password", { email, otp, newPassword });
    return res.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },

  // Get logged-in user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user") || sessionStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.warn("Failed to parse user from storage:", e);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  },
};

export default api;
