import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';
import { Card, CardContent } from '@/core/components/ui/card';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { useAuthStore } from '../services/AuthService';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const solicitarRecuperacion = useAuthStore(state => state.solicitarRecuperacion);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            const result = await solicitarRecuperacion(email);
            setMessage(result.mensaje);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response: { data: { error?: string } } };
                setError(axiosErr.response.data?.error || 'Ocurrió un error. Por favor intenta más tarde.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error. Por favor intenta más tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col gap-6 max-w-sm mx-auto">
                        {/* Header */}
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">¿Olvidaste tu contraseña?</h1>
                            <p className="text-sm text-muted-foreground">
                                Ingresa tu correo y te enviaremos un enlace para restablecerla
                            </p>
                        </div>

                        {/* Success message */}
                        {message && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {!message && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="tu@correo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-10 h-11"
                                        />
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : 'Enviar enlace de recuperación'}
                                </Button>
                            </form>
                        )}

                        <div className="text-center text-sm text-muted-foreground">
                            <Link to="/auth/login" className="text-primary font-medium hover:underline transition-colors">
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
