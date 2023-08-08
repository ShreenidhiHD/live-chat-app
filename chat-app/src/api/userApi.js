import axios from 'axios';
const API_BASE_URL = 'http://170.187.232.251';
export const fetchUserData = async (authToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/userdata`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
