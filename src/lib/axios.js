import axios from 'axios';

import toast from 'react-hot-toast';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://sea-turtle-app-g4msm.ondigitalocean.app/api'
    : 'http://localhost:5000/api');

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/verify-otp',
  '/forgot-password',
  '/reset-password',
];

const axiosInstance = axios.create({
  baseURL: API_URL,
  // 60s timeout accommodates Render free-tier cold starts without aborting prematurely
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const pathname = window.location.pathname;
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (status === 401) {
      // Only tear down the session when the user actually had one.
      // A 401 from a public page (e.g. an auth-gated public read) must NOT
      // log out an anonymous visitor or bounce them to /login.
      const hadToken = Boolean(localStorage.getItem('token'));

      if (hadToken && !isPublicRoute) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Keep the middleware cookie in sync, otherwise the server-side route
        // guard would still consider the visitor signed in.
        document.cookie = 'rentzy_token=; path=/; max-age=0; SameSite=Lax';
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // 403 = authenticated but not allowed. Never log the user out for this.
      toast.error(error.response?.data?.message || 'You do not have access to this resource');
    } else if (status === 500) {
      toast.error('Server Error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
