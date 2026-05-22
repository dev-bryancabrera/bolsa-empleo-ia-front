import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/core/services/supabaseClient';
import { useAuthStore } from '../services/AuthService';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const processGoogleCallback = useAuthStore(state => state.processGoogleCallback);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    throw sessionError || new Error('No se obtuvo sesión de Supabase');
                }

                const token = session.access_token;

                const { data } = await bolsaEmpleoIA.post('/auth/google/sync', null, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                processGoogleCallback(token, data.usuario);
                navigate('/dashboard', { replace: true });
            } catch (err) {
                console.error('Error en callback de Google:', err);
                setError('Error al autenticar con Google. Redirigiendo...');
                setTimeout(() => navigate('/auth/login?error=google_auth_failed', { replace: true }), 2000);
            }
        };

        handleCallback();
    }, []);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                {error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : (
                    <>
                        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-muted-foreground text-sm">Autenticando con Google...</p>
                    </>
                )}
            </div>
        </div>
    );
}
