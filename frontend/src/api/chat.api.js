import axios from 'axios';

const VITE_CHAT_APP_API_BASE = import.meta.env.VITE_CHAT_APP_API_BASE; // your chatApp backend url
const JWTtoken = localStorage.getItem('token') || '';

export const getAllChatsForUser = async () => {
  try {
    const response = await axios.get(`${VITE_CHAT_APP_API_BASE}/chats`, {
      headers: {
        Authorization: `Bearer ${JWTtoken}`,
      },
    });

    return response.data.data; // the chats
  } catch (error) {
    console.log(error);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

// Leave group chat
export const leaveGroupChat = async (chatId) => {
  try {
    const response = await axios.delete(`${VITE_CHAT_APP_API_BASE}/chats/${chatId}/leave`, {
      headers: {
        Authorization: `Bearer ${JWTtoken}`,
      },
    });

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to leave chat' };
  }
};

// Add users to group chat
export const addUsersToGroup = async (chatId, participantsId) => {
  try {
    const response = await axios.post(
      `${VITE_CHAT_APP_API_BASE}/chats/${chatId}/add`,
      {
        participantsId
      },
      {
        headers: {
          Authorization: `Bearer ${JWTtoken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add users' };
  }
};

// Remove users from group chat
export const removeUsersFromGroup = async (chatId, participantsId) => {
  try {
    const response = await axios.post(
      `${VITE_CHAT_APP_API_BASE}/chats/${chatId}/remove`,
      {
        participantsId
      },
      {
        headers: {
          Authorization: `Bearer ${JWTtoken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove users' };
  }
};

// Promote users to admin
export const promoteUsersToAdmin = async (chatId, beingPromotedToAdmins) => {
  try {
    const response = await axios.post(
      `${VITE_CHAT_APP_API_BASE}/chats/${chatId}/promote`,
      {
        beingPromotedToAdmins
      },
      {
        headers: {
          Authorization: `Bearer ${JWTtoken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to promote users' };
  }
};

// Demote users from admin
export const demoteUsersFromAdmin = async (chatId, beingDemotedFromAdmins) => {
  try {
    const response = await axios.post(
      `${VITE_CHAT_APP_API_BASE}/chats/${chatId}/demote`,
      {
        beingDemotedFromAdmins
      },
      {
        headers: {
          Authorization: `Bearer ${JWTtoken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to demote users' };
  }
};

// Archive or unarchive chats
export const archiveOrUnarchiveChats = async (chatIds) => {
  try {
    const response = await axios.patch(
      `${VITE_CHAT_APP_API_BASE}/chats/archive`,
      {
        chatIds
      },
      {
        headers: {
          Authorization: `Bearer ${JWTtoken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to archive chats' };
  }
};

// Get chat details
export const getChatDetails = async (chatId) => {
  try {
    const response = await axios.get(`${VITE_CHAT_APP_API_BASE}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${JWTtoken}`,
      },
    });

    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get chat details' };
  }
};
