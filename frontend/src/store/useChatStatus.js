// src/store/useChatStatus.js
import { create } from 'zustand';
export const useChatStatus = create((set, get) => ({
  activeStatuses: {}, // { [userId]: 'online' | 'offline' }
  typingStatus: {}, // { [chatId]: boolean }

  setUserStatus: (userId, status) =>
    set((state) => ({
      activeStatuses: { ...state.activeStatuses, [userId]: status },
    })),

  setTyping: (chatId, isTyping) =>
    set((state) => ({
      typingStatus: { ...state.typingStatus, [chatId]: isTyping },
    })),

  // Set current user status to online (called when user connects)
  setCurrentUserOnline: (userId) => {
    set((state) => ({
      activeStatuses: { ...state.activeStatuses, [userId]: 'online' },
    }));
    console.log(`Current user ${userId} set to online in store`);
  },

  // Initialize statuses from backend
  initializeStatuses: async () => {
    try {
      // You can add an API call here to get initial user statuses
      // For now, we'll set a default offline status
      console.log('Initializing user statuses...');
    } catch (error) {
      console.error('Failed to initialize user statuses:', error);
    }
  },

  initSocketListeners: (socket) => {
    // Listen for online/offline status updates
    socket.on('user_status_changed', ({ userId, status }) => {
      get().setUserStatus(userId, status);
    });

    // Listen for typing events
    socket.on('typing', ({ chatId }) => {
      get().setTyping(chatId, true);
    });

    socket.on('stopTyping', ({ chatId }) => {
      get().setTyping(chatId, false);
    });
  },
}));
