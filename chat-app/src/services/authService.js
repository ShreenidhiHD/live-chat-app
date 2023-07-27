import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const register = (name, email, password) => {
    return axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
    });
};

export const login = (email, password) => {
    return axios.post(`${API_URL}/login`, {
        email,
        password,
    });
};

export const logout = () => {
    return axios.post(`${API_URL}/logout`);
};
