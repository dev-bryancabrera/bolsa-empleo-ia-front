import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    nombre: string;
    email: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    credentials: string | null;
    login: (user: User, email: string, password: string) => void;
    logout: () => void;
    getAuthHeader: () => Record<string, string>;
}


export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        isAuthenticated: false,
        user: null,
        credentials: null,
        login: (user, email, password) => {
            const encodedCredentials = btoa(`${email}:${password}`);
            set({
                isAuthenticated: true,
                user: user,
                credentials: encodedCredentials
            });
        },
        logout: () => set({
            isAuthenticated: false,
            user: null,
            credentials: null
        }),
        getAuthHeader: () => {
            const { credentials } = get();
            return credentials ? { Authorization: `Basic ${credentials}` } : { Authorization: '' };
        }
    }),
        {
            name: 'auth-storage',
        }
    )
)