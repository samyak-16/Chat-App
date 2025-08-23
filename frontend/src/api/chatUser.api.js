import axios from 'axios';

const VITE_CHAT_APP_API_BASE = import.meta.env.VITE_CHAT_APP_API_BASE; // your chatApp backend url
const JWTtoken = localStorage.getItem('token') || '';
export const getMe = async () => {
  try {
    const response = await axios.get(`${VITE_CHAT_APP_API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${JWTtoken}` },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};
