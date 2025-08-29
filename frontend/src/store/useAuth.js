// src/store/useAuth.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logoutUser } from '../api/auth.api';

export const useAuth = create(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await logoutUser();
          localStorage.removeItem('token'); // remove token
          set({ user: null });
        } catch (err) {
          console.error('Logout failed:', err);
          localStorage.removeItem('token');
          set({ user: null });
        }
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);
