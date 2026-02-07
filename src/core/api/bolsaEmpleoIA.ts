import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariable';

const { VITE_API_URL } = getEnvVariables();

const bolsaEmpleoIA = axios.create({
    baseURL: VITE_API_URL
});

// Middleware de Axios: Intercepta cada petición para añadir el Token
bolsaEmpleoIA.interceptors.request.use(config => {
    // Obtenemos el token del localStorage (o de tu store)
    const token = localStorage.getItem('token');

    if (token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
        } as any;
    }

    return config;
});

export default bolsaEmpleoIA;