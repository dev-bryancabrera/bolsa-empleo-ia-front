import { useState, useEffect } from 'react';
import {
    Camera, User, Mail, Phone, MapPin, Calendar, Save, X, Edit2,
    Briefcase, Globe, GraduationCap, FileText, Github, Linkedin,
    Building2, Clock, DollarSign, BadgeCheck, Shield,
} from 'lucide-react';
import { UserService } from '@/modules/users/services/UserService';
import type { PersonaData } from '@/modules/users/types/PersonaTypes';
import type { UsuarioData } from '@/modules/users/types/UserTypes';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { PersonaService } from '@/modules/users/services/PersonaServices';
import { toast } from 'react-toastify';

type FormDataType = PersonaData & { email: string };

const COMPLETITUD_CAMPOS: (keyof FormDataType)[] = [
    'nombre', 'apellido', 'identificacion', 'telefono', 'fecha_nacimiento',
    'titulo_profesional', 'descripcion', 'nivel_educativo', 'genero',
    'ciudad', 'pais', 'linkedin', 'modalidad_trabajo', 'disponibilidad', 'sector_interes',
];

const NIVEL_EDUCATIVO_OPTIONS = [
    'Bachillerato', 'Técnico', 'Tecnólogo', 'Universitario (en curso)',
    'Universitario completo', 'Especialización', 'Maestría', 'Doctorado',
];

const MODALIDAD_OPTIONS = ['Presencial', 'Remoto', 'Híbrido', 'Indiferente'];

const DISPONIBILIDAD_OPTIONS = [
    'Inmediata', 'En 15 días', 'En 1 mes', 'En 2 meses', 'Solo fines de semana', 'Medio tiempo',
];

const SECTOR_OPTIONS = [
    'Tecnología / Software', 'Finanzas / Banca', 'Salud / Medicina', 'Educación',
    'Marketing / Publicidad', 'Logística / Supply Chain', 'Manufactura / Industria',
    'Consultoría', 'Gobierno / Sector Público', 'Comercio / Retail', 'Otro',
];

const GENERO_OPTIONS = ['Masculino', 'Femenino', 'No binario', 'Prefiero no indicar'];

const inputClass = (editing: boolean) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none text-foreground
    ${editing
        ? 'border-indigo-300 bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        : 'border-transparent bg-muted/50 cursor-default'
    }`;

const selectClass = (editing: boolean) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none text-foreground
    ${editing
        ? 'border-indigo-300 bg-background focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer'
        : 'border-transparent bg-muted/50 cursor-default appearance-none'
    }`;

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    accent?: string;
}

const Section = ({ icon, title, children, accent = 'text-indigo-600' }: SectionProps) => (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <h3 className={`text-base font-semibold text-foreground mb-5 flex items-center gap-2 ${accent}`}>
            {icon}
            <span className="text-foreground">{title}</span>
        </h3>
        {children}
    </div>
);

export const UserInfoPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const [usuario, setUsuario] = useState<UsuarioData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormDataType>({
        nombre: '', apellido: '', identificacion: '', telefono: '',
        fecha_nacimiento: '', direccion: '', ciudad: '', pais: '',
        email: '', titulo_profesional: '', descripcion: '', nivel_educativo: '',
        genero: '', linkedin: '', github: '', sitio_web: '',
        modalidad_trabajo: '', disponibilidad: '', salario_esperado: '', sector_interes: '',
    });

    useEffect(() => { obtenerPerfil(); }, []);

    const obtenerPerfil = async () => {
        try {
            setLoading(true);
            const data = await UserService.obtenerPerfil(authUser.id);
            let fotoPerfilBase64 = null;
            if (data.foto_perfil?.data) {
                fotoPerfilBase64 = bufferToBase64(data.foto_perfil.data);
                data.foto_perfil = fotoPerfilBase64;
            }
            setUsuario(data);
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
                titulo_profesional: data.persona?.titulo_profesional || '',
                descripcion: data.persona?.descripcion || '',
                nivel_educativo: data.persona?.nivel_educativo || '',
                genero: data.persona?.genero || '',
                linkedin: data.persona?.linkedin || '',
                github: data.persona?.github || '',
                sitio_web: data.persona?.sitio_web || '',
                modalidad_trabajo: data.persona?.modalidad_trabajo || '',
                disponibilidad: data.persona?.disponibilidad || '',
                salario_esperado: data.persona?.salario_esperado || '',
                sector_interes: data.persona?.sector_interes || '',
            });
            if (fotoPerfilBase64) setImagePreview(fotoPerfilBase64);
        } catch {
            toast.error('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value || null }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const usuarioData: Partial<UsuarioData> = { email: formData.email };
            if (selectedFile) usuarioData.foto_perfil = await fileToBase64(selectedFile);
            await UserService.actualizarPerfil(usuario!.id!, usuarioData);

            if (usuario?.id_persona) {
                const { email: _email, ...personaFields } = formData;
                await PersonaService.actualizarPersona(usuario.id_persona, personaFields);
            }

            toast.success('Perfil actualizado exitosamente');
            setIsEditing(false);
            setSelectedFile(null);
            await obtenerPerfil();
        } catch {
            toast.error('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedFile(null);
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
                titulo_profesional: usuario.persona?.titulo_profesional || '',
                descripcion: usuario.persona?.descripcion || '',
                nivel_educativo: usuario.persona?.nivel_educativo || '',
                genero: usuario.persona?.genero || '',
                linkedin: usuario.persona?.linkedin || '',
                github: usuario.persona?.github || '',
                sitio_web: usuario.persona?.sitio_web || '',
                modalidad_trabajo: usuario.persona?.modalidad_trabajo || '',
                disponibilidad: usuario.persona?.disponibilidad || '',
                salario_esperado: usuario.persona?.salario_esperado || '',
                sector_interes: usuario.persona?.sector_interes || '',
            });
            if (usuario.foto_perfil) setImagePreview(usuario.foto_perfil);
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
            const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join('');
            return `data:image/png;base64,${btoa(binString)}`;
        } catch {
            return null;
        }
    };

    const completitud = Math.round(
        (COMPLETITUD_CAMPOS.filter((k) => {
            const v = formData[k];
            return v !== null && v !== undefined && String(v).trim() !== '';
        }).length / COMPLETITUD_CAMPOS.length) * 100
    );

    const completitudColor = completitud >= 80 ? 'bg-emerald-500' : completitud >= 50 ? 'bg-amber-500' : 'bg-rose-500';
    const completitudText = completitud >= 80 ? 'text-emerald-600' : completitud >= 50 ? 'text-amber-600' : 'text-rose-600';

    const rolLabel = usuario?.rol === 'admin' ? 'Administrador' : usuario?.rol === 'recruiter' ? 'Reclutador' : 'Candidato';
    const rolColor = usuario?.rol === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : usuario?.rol === 'recruiter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">

                {/* ── Hero Card ── */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    {/* Banner */}
                    <div className="h-28 sm:h-36 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Editar perfil</span>
                            </button>
                        )}
                    </div>

                    {/* Avatar + info */}
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-14">
                            {/* Avatar */}
                            <div className="relative group w-fit">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-400">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Foto de perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-white" />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* Buttons (editing mode) */}
                            {isEditing && (
                                <div className="flex gap-3 sm:self-auto self-end">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-sm transition-all"
                                    >
                                        {saving ? (
                                            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Guardando...</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Guardar</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Name & role */}
                        <div className="mt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                                    {formData.nombre || 'Sin nombre'} {formData.apellido}
                                </h1>
                                {usuario?.activo && (
                                    <BadgeCheck className="w-5 h-5 text-indigo-500" />
                                )}
                            </div>
                            {formData.titulo_profesional && (
                                <p className="text-muted-foreground text-sm mt-0.5">{formData.titulo_profesional}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rolColor}`}>
                                    {rolLabel}
                                </span>
                                {formData.ciudad && formData.pais && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" /> {formData.ciudad}, {formData.pais}
                                    </span>
                                )}
                                {formData.disponibilidad && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                        <Clock className="w-3 h-3" /> {formData.disponibilidad}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Completitud del perfil ── */}
                <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-foreground">Completitud del perfil</span>
                        </div>
                        <span className={`text-sm font-bold ${completitudText}`}>{completitud}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${completitudColor}`}
                            style={{ width: `${completitud}%` }}
                        />
                    </div>
                    {completitud < 100 && (
                        <p className="text-xs text-muted-foreground/60 mt-2">
                            Completa tu perfil para tener más visibilidad ante los reclutadores.
                        </p>
                    )}
                </div>

                {/* ── Grid principal ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna izquierda (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Sobre mí */}
                        <Section icon={<FileText className="w-4 h-4" />} title="Sobre mí">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Título profesional</label>
                                    <input
                                        type="text"
                                        name="titulo_profesional"
                                        value={formData.titulo_profesional || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Ej: Desarrollador Full Stack · Diseñadora UX"
                                        className={inputClass(isEditing)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Descripción / Bio</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows={4}
                                        placeholder="Cuéntanos un poco sobre ti, tu experiencia y lo que buscas..."
                                        className={`${inputClass(isEditing)} resize-none`}
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Información personal */}
                        <Section icon={<User className="w-4 h-4" />} title="Información personal">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Apellido</label>
                                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Identificación</label>
                                    <input type="text" name="identificacion" value={formData.identificacion} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Fecha de nacimiento
                                    </label>
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Género</label>
                                    <select name="genero" value={formData.genero || ''} onChange={handleChange} disabled={!isEditing} className={selectClass(isEditing)}>
                                        <option value="">Seleccionar...</option>
                                        {GENERO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3" /> Nivel educativo
                                    </label>
                                    <select name="nivel_educativo" value={formData.nivel_educativo || ''} onChange={handleChange} disabled={!isEditing} className={selectClass(isEditing)}>
                                        <option value="">Seleccionar...</option>
                                        {NIVEL_EDUCATIVO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Section>

                        {/* Preferencias laborales */}
                        <Section icon={<Briefcase className="w-4 h-4" />} title="Preferencias laborales">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> Modalidad de trabajo
                                    </label>
                                    <select name="modalidad_trabajo" value={formData.modalidad_trabajo || ''} onChange={handleChange} disabled={!isEditing} className={selectClass(isEditing)}>
                                        <option value="">Seleccionar...</option>
                                        {MODALIDAD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Disponibilidad
                                    </label>
                                    <select name="disponibilidad" value={formData.disponibilidad || ''} onChange={handleChange} disabled={!isEditing} className={selectClass(isEditing)}>
                                        <option value="">Seleccionar...</option>
                                        {DISPONIBILIDAD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> Sector de interés
                                    </label>
                                    <select name="sector_interes" value={formData.sector_interes || ''} onChange={handleChange} disabled={!isEditing} className={selectClass(isEditing)}>
                                        <option value="">Seleccionar...</option>
                                        {SECTOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> Pretensión salarial
                                    </label>
                                    <input
                                        type="text"
                                        name="salario_esperado"
                                        value={formData.salario_esperado || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Ej: $1,500 - $2,000 USD"
                                        className={inputClass(isEditing)}
                                    />
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Columna derecha (1/3) */}
                    <div className="space-y-6">

                        {/* Contacto */}
                        <Section icon={<Phone className="w-4 h-4" />} title="Contacto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email
                                    </label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Teléfono
                                    </label>
                                    <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                            </div>
                        </Section>

                        {/* Ubicación */}
                        <Section icon={<MapPin className="w-4 h-4" />} title="Ubicación">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Dirección</label>
                                    <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ciudad</label>
                                    <input type="text" name="ciudad" value={formData.ciudad || ''} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">País</label>
                                    <input type="text" name="pais" value={formData.pais || ''} onChange={handleChange} disabled={!isEditing} className={inputClass(isEditing)} />
                                </div>
                            </div>
                        </Section>

                        {/* Presencia digital */}
                        <Section icon={<Globe className="w-4 h-4" />} title="Presencia digital">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Linkedin className="w-3 h-3 text-[#0077b5]" /> LinkedIn
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin || ''}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/..."
                                            className={inputClass(isEditing)}
                                        />
                                    ) : formData.linkedin ? (
                                        <a
                                            href={formData.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-[#0077b5] hover:underline truncate"
                                        >
                                            <Linkedin className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{formData.linkedin.replace('https://', '')}</span>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/60 italic">No configurado</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Github className="w-3 h-3" /> GitHub / Portfolio
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            name="github"
                                            value={formData.github || ''}
                                            onChange={handleChange}
                                            placeholder="https://github.com/..."
                                            className={inputClass(isEditing)}
                                        />
                                    ) : formData.github ? (
                                        <a
                                            href={formData.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-foreground hover:underline truncate"
                                        >
                                            <Github className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{formData.github.replace('https://', '')}</span>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/60 italic">No configurado</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Globe className="w-3 h-3 text-indigo-500" /> Sitio web
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            name="sitio_web"
                                            value={formData.sitio_web || ''}
                                            onChange={handleChange}
                                            placeholder="https://mipagina.com"
                                            className={inputClass(isEditing)}
                                        />
                                    ) : formData.sitio_web ? (
                                        <a
                                            href={formData.sitio_web}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline truncate"
                                        >
                                            <Globe className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{formData.sitio_web.replace('https://', '')}</span>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/60 italic">No configurado</p>
                                    )}
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>

                {/* Guardar flotante en mobile cuando está editando */}
                {isEditing && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex gap-3 z-50 shadow-lg">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar cambios
                        </button>
                    </div>
                )}
                {/* Espacio extra para no tapar contenido con el bar flotante en mobile */}
                {isEditing && <div className="lg:hidden h-20" />}
            </form>
        </div>
    );
};
