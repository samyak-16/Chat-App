import axios from 'axios';

const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE; // your Auth url

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${AUTH_API_BASE}/auth/register`,
      userData
    );
    return response.data; // contains success info or token
  } catch (error) {
    console.log(error);
    throw error.response?.data || { message: 'Something went wrong' }; //throw an error to parent try/catch in main logic
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(
      `${AUTH_API_BASE}/auth/login`,
      credentials,
      {
        withCredentials: true,
        // Allows browser to send cookies and allow browser to accept the setCookie header sent by the server  :  “Hey, if the server sends me a Set-Cookie header in the response, don’t ignore it — actually save it.”
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);

    throw error.response?.data || { message: 'Something went wrong' };
  }
};

export const verifyUser = async (token) => {
  try {
    const response = await axios.get(`${AUTH_API_BASE}/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

export const logoutUser = async () => {
  try {
    const response = await axios.post(
      `${AUTH_API_BASE}/auth/logout`,

      {
        withCredentials: true,
      }
    );
  } catch (error) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};
