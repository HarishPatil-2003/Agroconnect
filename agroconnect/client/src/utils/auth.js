import axios from "axios";

// Axios instance using proxy (backend on 5001)
const api = axios.create({
  baseURL: "/api",
});

// Attach JWT token automatically   checking only data available or not
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth helper methods
export const auth = {
  // Register user
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
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

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get logged-in user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // ✅ THIS FIXES THE CRASH
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default api;
