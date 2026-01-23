import axios from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariable';
import { useAuthStore } from '@/modules/auth/store/AuthStore';

const { VITE_API_URL } = getEnvVariables();

const carfaithApi = axios.create({
    baseURL: VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

carfaithApi.interceptors.request.use(
    (config) => {
        const authHeader = useAuthStore.getState().getAuthHeader();
        if (authHeader.Authorization) {
            config.headers.Authorization = authHeader.Authorization;
        }

        // console.log(authHeader);
        return config;
    },
    (error) => {
        console.error("Error in request:", error);
        return Promise.reject(error);
    }
)

export default carfaithApi;