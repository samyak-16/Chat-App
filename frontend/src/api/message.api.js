import axios from 'axios';

const VITE_CHAT_APP_API_BASE = import.meta.env.VITE_CHAT_APP_API_BASE;

export const getMessages = async (chatId, limit = 20, before) => {
  const JWTtoken = localStorage.getItem('token') || '';

  try {
    const response = await axios.get(
      `${VITE_CHAT_APP_API_BASE}/messages/${chatId}`,
      {
        headers: {
          Authorization: `Bearer ${JWTtoken}`,
        },
        params: {
          // pass query parameters here
          limit,
          before,
        },
      }
    );
    console.log('data', response.data.data);

    return response.data.data;
  } catch (error) {
    // AxiosError structure: error.response?.data has server response
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

export const sendMessage = async (chatId, content, files = []) => {
  const JWTtoken = localStorage.getItem('token') || '';

  try {
    let response;

    if (files.length > 0) {
      // Send with files using FormData
      const formData = new FormData();
      formData.append('chatId', chatId);
      
      if (content && content.trim()) {
        formData.append('textMessage', content.trim());
      }
      
      files.forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.type, file.size);
        formData.append('media', file);
      });

      console.log('Sending FormData with files:', files.length, 'files');

      response = await axios.post(
        `${VITE_CHAT_APP_API_BASE}/messages/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${JWTtoken}`,
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
        }
      );
    } else {
      // Send text only
      response = await axios.post(
        `${VITE_CHAT_APP_API_BASE}/messages/send`,
        {
          chatId,
          textMessage: content
        },
        {
          headers: {
            Authorization: `Bearer ${JWTtoken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error response:', error.response?.data);
    throw error.response?.data || { message: 'Failed to send message' };
  }
};
