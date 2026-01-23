import { useNavigate } from "react-router"

import { cn } from "@/lib/utils"

import { Button } from "@/core/components/ui/button"
import { Card, CardContent } from "@/core/components/ui/card"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import logoCarfaith from "../../../assets/logo-carfaith.png";
import React, { useState } from "react"
import { Login } from "../services/AuthService"
import axios from "axios"

export function LoginPage({ className, ...props }: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setisLoading] = useState(false);
    const [error, setError] = useState<string | null>('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setisLoading(true);
        setError(null);

        try {
            const response = await Login(email, password);
            if (response && response.data) {
                if (response.data.message === 'Login exitoso') {
                    navigate('/dashboard');
                } else if (response.data.error) {
                    setError(response.data.error)
                }
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    setError('Correo o contraseña incorrectos');
                } else {
                    setError('Error al iniciar sesión. Inténtalo de nuevo.');
                }
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión. Inténtalo de nuevo.';
                setError(errorMessage);
            }
            console.error("Error en login:", error);
        } finally {
            setisLoading(false);
        }

    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-3xl font-semibold text-primary mb-2">¡Bienvenido de nuevo!</h1>
                                <p className="text-sm text-muted-foreground">
                                    Por favor, inicia sesión con tus credenciales para continuar.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Cargando...' : 'Login'}
                            </Button>
                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden h-full bg-muted md:block">
                        <div className="flex h-full items-center justify-center p-6">
                            <img
                                src={logoCarfaith}
                                alt="Carfaith Logo"
                                className="max-h-40 w-auto object-contain"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}

