import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import { supabase } from '@/core/services/supabaseClient';

interface AuthState {
    status: 'checking' | 'authenticated' | 'not-authenticated';
    user: any;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    processGoogleCallback: (token: string, user: any) => void;
    solicitarRecuperacion: (email: string) => Promise<{ mensaje: string }>;
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

            loginWithGoogle: async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
            },

            processGoogleCallback: (token: string, user: any) => {
                localStorage.setItem('token', token);
                set({ status: 'authenticated', user });
            },

            solicitarRecuperacion: async (email: string) => {
                const response = await bolsaEmpleoIA.post('/auth/recuperar-password', { email });
                return response.data;
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
                supabase.auth.signOut();
                set({ status: 'not-authenticated', user: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                status: state.status,
                user: state.user,
            }),
        }
    )
);
