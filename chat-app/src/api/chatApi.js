import axios from 'axios';

export const fetchChats = async (authToken) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/agent/chats`, {
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
    const response = await axios.get(`http://localhost:8000/api/chats/latest`, {
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
    const response = await axios.get(`http://localhost:8000/api/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const createChat = async (authToken) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/chats',
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const sendMessage = async (authToken, chatId, newMessage, user) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/send',
        {
          content: newMessage,
          chat_id: chatId,
          sender_id: user.curid,
          sender_name: user.curname,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Message Sent:', response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const markMessageAsRead = async (authToken, messageId) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/messages/read',
        {
          message_id: messageId,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Message Marked As Read:', response.data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };