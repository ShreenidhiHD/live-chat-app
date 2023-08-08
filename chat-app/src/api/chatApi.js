import axios from 'axios';
const API_BASE_URL = 'http://170.187.232.251';

export const fetchChats = async (authToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agent/chats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchLatestChat = async (authToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chats/latest`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchMessages = async (authToken, chatId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('Too many requests, please slow down');
    } else {
      console.error(error);
    }
  }
};


export const createChat = async (authToken) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chats`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const sendMessage = async (authToken, messageData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/send`,
        {
          content: messageData.content,
          chat_id: messageData.chatId,
          sender_id: messageData.sender.id,
          sender_name: messageData.sender.name,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Message Sent:', response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  
  

  export const markMessageAsRead = async (authToken, messageIds) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/messages/read`,
        {
          message_ids: messageIds,  // Note the change here
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Messages Marked As Read:', response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  export const notifyUserTyping = async (authToken, typingData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user-typing`,
        {
          chat_id: typingData.chatId
          // user_id: typingData.userId
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('User Typing Notification:', response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  