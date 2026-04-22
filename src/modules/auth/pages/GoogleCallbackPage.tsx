import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../services/AuthService';

export function GoogleCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const processGoogleCallback = useAuthStore(state => state.processGoogleCallback);

    useEffect(() => {
        const token = searchParams.get('token');
        const userEncoded = searchParams.get('user');
        const error = searchParams.get('error');

        if (error || !token || !userEncoded) {
            navigate('/auth/login?error=google_auth_failed', { replace: true });
            return;
        }

        try {
            const user = JSON.parse(decodeURIComponent(userEncoded));
            processGoogleCallback(token, user);
            navigate('/dashboard', { replace: true });
        } catch {
            navigate('/auth/login?error=google_auth_failed', { replace: true });
        }
    }, []);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-muted-foreground text-sm">Autenticando con Google...</p>
            </div>
        </div>
    );
}
