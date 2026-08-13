import axios from 'axios';

import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    // Determine how token is stored (e.g. localStorage if client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname === "/login";
        if (!isLoginPage) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = "/login";
        }
      }
    } else if (error.response?.status === 500) {
       toast.error("Server Error. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
