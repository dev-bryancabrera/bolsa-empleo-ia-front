import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';

interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    user: any;
    login: (email: string, pass: string) => Promise<void>;
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
                    throw error; // ← Importante para el manejo de errores
                }
            },
            
            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ status: 'not-authenticated' });
                    return; // ← Cambio aquí: return sin nada
                }

                try {
                    const { data } = await bolsaEmpleoIA.get('/auth/verificar-token');
                    set({ status: 'authenticated', user: data.usuario });
                } catch (error) {
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
            name: 'auth-storage', // ← Mismo nombre que tenías antes
            partialize: (state) => ({ // ← Solo persiste estos campos
                status: state.status,
                user: state.user
            })
        }
    )
);