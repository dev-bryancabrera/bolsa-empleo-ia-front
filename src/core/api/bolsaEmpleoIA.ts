import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariable';

const { VITE_API_URL } = getEnvVariables();

const bolsaEmpleoIA = axios.create({
    baseURL: VITE_API_URL
});

bolsaEmpleoIA.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

bolsaEmpleoIA.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:token-expirado'));
        }
        return Promise.reject(error);
    }
);

export default bolsaEmpleoIA;