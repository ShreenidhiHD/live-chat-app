import axios from 'axios';

export const fetchUserData = async (authToken) => {
  try {
    const response = await axios.get('http://localhost:8000/api/userdata', {
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
