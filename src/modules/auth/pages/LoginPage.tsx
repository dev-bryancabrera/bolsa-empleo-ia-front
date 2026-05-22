import { useNavigate, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/core/components/ui/button"
import { Card, CardContent } from "@/core/components/ui/card"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import logoBolsaEmpleo from "@/assets/logo_aprendizaje_ia.png";
import React, { useState } from "react"
import { useAuthStore } from "../services/AuthService"
import axios from "axios"

export function LoginPage({ className, ...props }: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>('');

    const login = useAuthStore((state) => state.login);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error: unknown) {
            console.error("Error en login:", error);
            if (axios.isAxiosError(error) && error.response) {
                const mensajeBackend = error.response.data?.error || error.response.data?.message;
                if (error.response.status === 401) {
                    setError(mensajeBackend || 'Correo o contraseña incorrectos');
                } else {
                    setError('Ocurrió un error en el servidor. Inténtalo más tarde.');
                }
            } else {
                setError('No se pudo conectar con el servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden border-0 shadow-2xl">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-8 md:p-10" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-foreground">¡Bienvenido de nuevo!</h1>
                                <p className="text-sm text-muted-foreground">Continúa tu camino hacia el empleo ideal</p>
                            </div>

                            {/* Botón Google */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 flex items-center gap-3 font-medium border-2 hover:bg-primary hover:text-white transition-all"
                                onClick={loginWithGoogle}
                            >
                                {/* Google SVG logo oficial */}
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Iniciar Sesión con Google
                            </Button>

                            {/* Separador */}
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">o inicia con tu correo</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="tu@correo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                                        <Link
                                            to="/auth/forgot-password"
                                            className="text-xs text-primary hover:underline transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Iniciando sesión...
                                    </span>
                                ) : 'Iniciar sesión'}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                ¿Buscas tu primera oportunidad?{' '}
                                <Link to="/auth/register" replace className="text-primary font-medium hover:underline transition-colors">
                                    Regístrate gratis
                                </Link>
                            </div>
                        </div>
                    </form>

                    {/* Panel derecho */}
                    <div className="relative hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background md:flex">
                        <div className="flex flex-col h-full items-center justify-center p-10">
                            <img src={logoBolsaEmpleo} alt="Logo" className="max-h-32 w-auto object-contain mb-8 drop-shadow-2xl" />
                            <div className="space-y-6 max-w-sm">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-foreground mb-3">Tu carrera profesional comienza aquí</h2>
                                    <p className="text-muted-foreground text-sm">Recibe recomendaciones de aprendizaje impulsadas por IA</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-sm mb-1">Sugerencias personalizadas</h3>
                                            <p className="text-xs text-muted-foreground">IA que aprende de tu perfil para recomendarte los mejores empleos</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-sm mb-1">Rutas de aprendizaje</h3>
                                            <p className="text-xs text-muted-foreground">Desarrolla las habilidades que las empresas buscan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-10 right-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
