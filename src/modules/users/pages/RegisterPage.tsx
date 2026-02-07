import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/core/components/ui/card';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Button } from '@/core/components/ui/button';

// Importar Servicio para comunicacion con el backend
import { UserService } from '@/modules/users/services/UserService';
import { DatePickerInput } from '@/core/components/ui/datePicker';
import { PersonaService } from '@/modules/users/services/PersonaServices';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        identificacion: '',
        telefono: '',
        fecha_nacimiento: undefined as Date | undefined,
        direccion: '',
        ciudad: '',
        pais: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Crear Persona
            const persona = await PersonaService.crearPersona({
                nombre: formData.nombre,
                apellido: formData.apellido,
                identificacion: formData.identificacion,
                telefono: formData.telefono || null,
                fecha_nacimiento: formData.fecha_nacimiento
                    ? formData.fecha_nacimiento.toISOString().split("T")[0]
                    : null,
                direccion: formData.direccion || null,
                ciudad: formData.ciudad || null,
                pais: formData.pais || null
            });

            // 2. Crear Usuario vinculado a la Persona
            await UserService.crearUsuario({
                id_persona: persona.id,
                email: formData.email,
                password: formData.password,
                rol: 'user',
                activo: true
            });

            // 3. Redirigir al login
            navigate('/auth/login', {
                state: { message: '¡Registro exitoso! Inicia sesión para continuar' }
            });

        } catch (err) {
            console.error('Error al registrarse:', err);
            setError(err.response?.data?.error || err.message || 'Error al registrarse. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden border-0 shadow-2xl w-full max-w-2xl">
            <CardContent className="p-0">
                <form className="p-8 md:p-10" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                <svg
                                    className="w-8 h-8 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Únete a nuestra comunidad
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Crea tu cuenta y potencia tu carrera profesional
                            </p>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Información Personal */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                                    Información Personal
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="identificacion" className="text-sm font-medium">
                                            Identificación
                                        </Label>
                                        <Input
                                            id="identificacion"
                                            name="identificacion"
                                            type="text"
                                            value={formData.identificacion}
                                            onChange={handleChange}
                                            className="h-11"
                                            placeholder="Ingrese su identificación"
                                        />
                                    </div>


                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="text-sm font-medium">
                                            Nombre <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="nombre"
                                            name="nombre"
                                            type="text"
                                            placeholder="Juan"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apellido" className="text-sm font-medium">
                                            Apellido <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="apellido"
                                            name="apellido"
                                            type="text"
                                            placeholder="Pérez"
                                            value={formData.apellido}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefono" className="text-sm font-medium">
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="telefono"
                                            name="telefono"
                                            type="tel"
                                            placeholder="+593 999 999 999"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Fecha de Nacimiento
                                        </Label>

                                        <DatePickerInput
                                            name="fecha_nacimiento"
                                            placeholder="Fecha de nacimiento"
                                            value={formData.fecha_nacimiento}
                                            onChange={(date) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    fecha_nacimiento: date,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Ubicación */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                                    Ubicación
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion" className="text-sm font-medium">
                                        Dirección
                                    </Label>
                                    <Input
                                        id="direccion"
                                        name="direccion"
                                        type="text"
                                        placeholder="Av. Principal 123"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className="h-11"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ciudad" className="text-sm font-medium">
                                            Ciudad
                                        </Label>
                                        <Input
                                            id="ciudad"
                                            name="ciudad"
                                            type="text"
                                            placeholder="Cuenca"
                                            value={formData.ciudad}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pais" className="text-sm font-medium">
                                            País
                                        </Label>
                                        <Input
                                            id="pais"
                                            name="pais"
                                            type="text"
                                            placeholder="Ecuador"
                                            value={formData.pais}
                                            onChange={handleChange}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Credenciales */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                                    Credenciales de Acceso
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Correo electrónico <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="correo@correo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Contraseña <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                            className="h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Mínimo 6 caracteres
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                            Confirmar contraseña <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creando cuenta...
                                </span>
                            ) : (
                                'Crear cuenta'
                            )}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center text-sm text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <Link
                                to="/auth/login"
                                className="text-primary font-medium hover:underline transition-colors"
                            >
                                Inicia sesión
                            </Link>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};