// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

// Base URL points to your deployed backend or local server
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/admin';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Layer A: Request Interceptor - Attach token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Access Zustand store outside of React components using getState()
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Layer A: Response Interceptor - Handle global errors (401, 403)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        useUIStore.getState().addToast("Session expired. Please log in again.", "error");
        useAuthStore.getState().logout();
        window.location.href = '/login'; // Force redirect to login
      } else if (error.response.status === 403) {
        // RBAC Forbidden - User tried to bypass UI restrictions
        // Skip global toast for auth endpoints so the login form handles its own 403s
        if (!error.config.url?.includes('/auth/')) {
          useUIStore.getState().addToast("Action Forbidden: You do not have permission to perform this action.", "error");
        }
      } else if (error.response.status >= 500) {
        useUIStore.getState().addToast("Server error. Please try again later.", "error");
      }
    } else {
      useUIStore.getState().addToast("Network error. Please check your connection.", "error");
    }
    return Promise.reject(error);
  }
);