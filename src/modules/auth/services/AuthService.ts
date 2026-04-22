import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import { getEnvVariables } from '@/core/helpers/getEnvVariable';

interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    user: any;
    login: (email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => void;
    processGoogleCallback: (token: string, user: any) => void;
    solicitarRecuperacion: (email: string) => Promise<{ mensaje: string }>;
    restablecerPassword: (token: string, nuevaPassword: string) => Promise<{ mensaje: string }>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            status: 'checking',
            user: null,

            login: async (email, password) => {
                try {
                    const { data } = await bolsaEmpleoIA.post('/auth/login', { email, password });
                    localStorage.setItem('token', data.token);
                    set({ status: 'authenticated', user: data.usuario });
                } catch (error) {
                    set({ status: 'not-authenticated', user: null });
                    localStorage.removeItem('token');
                    throw error;
                }
            },

            // Redirige al backend para iniciar el flujo OAuth2 de Google
            loginWithGoogle: () => {
                const { VITE_API_URL } = getEnvVariables();
                window.location.href = `${VITE_API_URL}/auth/google`;
            },

            // Procesa el callback de Google (recibe token y user desde la URL)
            processGoogleCallback: (token: string, user: any) => {
                localStorage.setItem('token', token);
                set({ status: 'authenticated', user });
            },

            solicitarRecuperacion: async (email: string) => {
                const { data } = await bolsaEmpleoIA.post('/auth/recuperar-password', { email });
                return data;
            },

            restablecerPassword: async (token: string, nuevaPassword: string) => {
                const { data } = await bolsaEmpleoIA.post('/auth/restablecer-password', { token, nuevaPassword });
                return data;
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ status: 'not-authenticated' });
                    return;
                }
                try {
                    const { data } = await bolsaEmpleoIA.get('/auth/verificar-token');
                    set({ status: 'authenticated', user: data.usuario });
                } catch {
                    localStorage.removeItem('token');
                    set({ status: 'not-authenticated' });
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ status: 'not-authenticated', user: null });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                status: state.status,
                user: state.user
            })
        }
    )
);