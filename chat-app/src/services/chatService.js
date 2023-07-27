import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchMessages = (chatId) => {
    return axios.get(`${API_URL}/chats/${chatId}/messages`);
};

export const sendMessage = (chatId, content) => {
    return axios.post(`${API_URL}/chats/${chatId}/messages`, {
        content,
    });
};

export const markAsRead = (messageId) => {
    return axios.post(`${API_URL}/messages/${messageId}/read`);
};
