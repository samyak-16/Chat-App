// src/store/useAuth.js
import { create } from 'zustand';
import { logoutUser } from '../api/auth.api';

// store/useAuth.js
export const useAuth = create((set) => ({
  //Implicit return

  
  user: null, // state

  setUser: (user) => set({ user }), // action

  logout: async () => {
    // action
    try {
      // API call
      await logoutUser(); // Removes cookies used for auth

      // Clear tokens used for chat app to verify user
      localStorage.removeItem('token');

      // Reset state
      set({ user: null });
    } catch (err) {
      console.error('Logout failed:', err);
      // still clear client-side
      localStorage.removeItem('accessToken');
      set({ user: null });
    }
  },
}));

// Basic Overview of stateManagement using Zustand :
