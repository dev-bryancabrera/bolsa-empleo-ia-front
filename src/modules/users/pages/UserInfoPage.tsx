import { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, MapPin, Calendar, Save, X, Edit2 } from 'lucide-react';
import { UserService } from '@/modules/users/services/UserService'; // Ajusta la ruta según tu estructura
import type { PersonaData } from '@/modules/users/types/PersonaTypes';
import type { UsuarioData } from '@/modules/users/types/UserTypes';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { PersonaService } from '@/modules/users/services/PersonaServices';
import { toast } from 'react-toastify';

export const UserInfoPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const [usuario, setUsuario] = useState<UsuarioData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<PersonaData & { email: string }>({
        // Datos de persona
        nombre: '',
        apellido: '',
        identificacion: '',
        telefono: '',
        fecha_nacimiento: '',
        direccion: '',
        ciudad: '',
        pais: '',
        // Datos de usuario
        email: '',
    });

    useEffect(() => {
        obtenerPerfil();
    }, []);

    const obtenerPerfil = async () => {
        try {
            setLoading(true);
            const data = await UserService.obtenerPerfil(authUser.id);

            // Convertir buffer a base64 si existe
            let fotoPerfilBase64 = null;
            if (data.foto_perfil?.data) {
                fotoPerfilBase64 = bufferToBase64(data.foto_perfil.data);
                data.foto_perfil = fotoPerfilBase64;
            }

            setUsuario(data);

            // Inicializar formulario con datos actuales
            setFormData({
                nombre: data.persona?.nombre || '',
                apellido: data.persona?.apellido || '',
                identificacion: data.persona?.identificacion || '',
                telefono: data.persona?.telefono || '',
                fecha_nacimiento: data.persona?.fecha_nacimiento || '',
                direccion: data.persona?.direccion || '',
                ciudad: data.persona?.ciudad || '',
                pais: data.persona?.pais || '',
                email: data.email || '',
            });

            // Establecer la imagen de preview
            if (fotoPerfilBase64) {
                setImagePreview(fotoPerfilBase64);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value || null,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Preparar datos de usuario (email y foto)
            const usuarioData: Partial<UsuarioData> = {
                email: formData.email,
            };

            // Si hay foto seleccionada, crear FormData
            if (selectedFile) {
                usuarioData.foto_perfil = await fileToBase64(selectedFile);
            }

            await UserService.actualizarPerfil(usuario.id, usuarioData);

            // 2. Actualizar datos de persona
            if (usuario?.id_persona) {
                const personaData: Partial<PersonaData> = {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    identificacion: formData.identificacion,
                    telefono: formData.telefono || null,
                    fecha_nacimiento: formData.fecha_nacimiento || null,
                    direccion: formData.direccion || null,
                    ciudad: formData.ciudad || null,
                    pais: formData.pais || null,
                };

                await PersonaService.actualizarPersona(usuario.id_persona, personaData);
            }

            toast.success('Perfil actualizado exitosamente');
            setIsEditing(false);
            setSelectedFile(null);
            await obtenerPerfil();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const bufferToBase64 = (buffer: number[]) => {
        try {
            const bytes = new Uint8Array(buffer);
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
            const base64 = btoa(binString);
            return `data:image/png;base64,${base64}`;
        } catch (error) {
            console.error('Error convirtiendo buffer a base64:', error);
            return null;
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedFile(null);
        // Restaurar datos originales
        if (usuario) {
            setFormData({
                nombre: usuario.persona?.nombre || '',
                apellido: usuario.persona?.apellido || '',
                identificacion: usuario.persona?.identificacion || '',
                telefono: usuario.persona?.telefono || '',
                fecha_nacimiento: usuario.persona?.fecha_nacimiento || '',
                direccion: usuario.persona?.direccion || '',
                ciudad: usuario.persona?.ciudad || '',
                pais: usuario.persona?.pais || '',
                email: usuario.email || '',
            });
            if (usuario.foto_perfil) {
                setImagePreview(usuario.foto_perfil);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
                    <p className="text-gray-600">Gestiona tu información personal</p>
                </div>

                {/* Card Principal */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header del Card con Foto */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 relative">
                        <div className="flex flex-col items-center">
                            {/* Foto de Perfil */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Foto de perfil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-400">
                                            <User className="w-16 h-16 text-white" />
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Nombre */}
                            <h2 className="mt-4 text-2xl font-bold text-white">
                                {formData.nombre} {formData.apellido}
                            </h2>
                            <p className="text-indigo-100">{formData.email}</p>

                            {/* Badge de Rol */}
                            <span className="mt-2 px-4 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                                {usuario?.rol}
                            </span>
                        </div>

                        {/* Botón de Editar */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-6 right-6 p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-all"
                            >
                                <Edit2 className="w-5 h-5 text-white" />
                            </button>
                        )}
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-8">
                            {/* Información Personal */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                                    Información Personal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Identificación
                                        </label>
                                        <input
                                            type="text"
                                            name="identificacion"
                                            value={formData.identificacion}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_nacimiento"
                                            value={formData.fecha_nacimiento || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-indigo-600" />
                                    Información de Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Mail className="w-4 h-4 mr-1" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Phone className="w-4 h-4 mr-1" />
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                                    Ubicación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ciudad
                                        </label>
                                        <input
                                            type="text"
                                            name="ciudad"
                                            value={formData.ciudad || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            País
                                        </label>
                                        <input
                                            type="text"
                                            name="pais"
                                            value={formData.pais || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        {isEditing && (
                            <div className="mt-8 flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};