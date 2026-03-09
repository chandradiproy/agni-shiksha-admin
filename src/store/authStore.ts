// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Match the exact roles defined in your Backend / Frontend Guide
// Note: Added 'content' to match the specific backend response payload provided
export type AdminRole = 'super_admin' | 'content_manager' | 'support_moderator' | 'analytics_finance' | 'content';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: AdminUser, token: string) => void;
  logout: () => void;
}

// Using persist middleware to keep user logged in across page refreshes
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData, token) => 
        set({ user: userData, token, isAuthenticated: true }),
      logout: () => 
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'agni-admin-auth', // Key used in localStorage
    }
  )
);