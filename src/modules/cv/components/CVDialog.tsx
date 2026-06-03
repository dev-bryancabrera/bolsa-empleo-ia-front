import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
import { Badge } from '@/core/components/ui/badge';
import { Card, CardContent } from '@/core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/core/components/ui/select';
import {
    Plus, Trash2, Briefcase, Award, GraduationCap, X, Loader2,
    Phone, MapPin, Globe, Linkedin, Github, Calendar, Languages, BadgeCheck, Mail,
} from 'lucide-react';
import type { HabilidadData } from '../types/HabilidadType';
import type { ExperienciaLaboral, Educacion, Idioma, Certificacion } from '../types/CVType';
import { CVService } from '../services/CVService';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { UserService } from '@/modules/users/services/UserService';
import { HabilidadService } from '../services/HabilidadService';
import {
    ExperienciaService,
    EducacionService,
    IdiomaService,
    CertificacionService,
} from '../services/CVSectionService';

// Schema de validación
const cvSchema = z.object({
    titulo_profesional: z.string().min(3, 'El título profesional debe tener al menos 3 caracteres'),
    resumen_profesional: z.string().min(50, 'El resumen debe tener al menos 50 caracteres'),
    nivel_educacion: z.string().min(1, 'Selecciona un nivel de educación'),
    anios_experiencia: z.number().min(0, 'Los años de experiencia no pueden ser negativos'),
    sector_profesional: z.string().min(3, 'El sector profesional es requerido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefono: z.string().optional(),
    linkedin_url: z.string().optional(),
    github_url: z.string().optional(),
    portfolio_url: z.string().optional(),
    ciudad: z.string().optional(),
    pais: z.string().optional(),
    disponibilidad: z.string().optional(),
    modalidad_trabajo: z.string().optional(),
});

const habilidadSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    categoria: z.string().min(2, 'La categoría es requerida'),
    nivel: z.enum(['Básico', 'Intermedio', 'Avanzado', 'Experto'], {
        message: 'Selecciona un nivel válido',
    }),
    anios_experiencia: z.number().min(0, 'Los años no pueden ser negativos').max(50, 'Máximo 50 años'),
});

interface CVDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCV?: any;
    habilidadesIniciales?: HabilidadData[];
    onSubmit: (editingCV: any, habilidades: HabilidadData[]) => void;
    scrollTo?: 'contacto';
}

const emptyExp = (): Omit<ExperienciaLaboral, 'id' | 'id_cv'> => ({
    empresa: '', cargo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', es_trabajo_actual: false,
});

const emptyEdu = (): Omit<Educacion, 'id' | 'id_cv'> => ({
    institucion: '', titulo: '', nivel: '', fecha_inicio: '', fecha_fin: '', en_curso: false, descripcion: '',
});

const emptyIdioma = (): Omit<Idioma, 'id' | 'id_cv'> => ({ nombre: '', nivel: '' });

const emptyCert = (): Omit<Certificacion, 'id' | 'id_cv'> => ({
    nombre: '', emisor: '', fecha: '', url_credencial: '',
});

export const CVDialog = ({
    open,
    onOpenChange,
    editingCV,
    habilidadesIniciales = [],
    onSubmit,
    scrollTo,
}: CVDialogProps) => {
    const [activeTab, setActiveTab] = useState('informacion');
    const contactoRef = useRef<HTMLDivElement>(null);
    const [habilidades, setHabilidades] = useState<HabilidadData[]>(habilidadesIniciales);
    const [habilidadesEliminadas, setHabilidadesEliminadas] = useState<number[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const authUser = useAuthStore((state) => state.user);
    const [editingHabilidadIndex, setEditingHabilidadIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sub-section state (local, saved on dialog submit)
    const [experiencias, setExperiencias] = useState<ExperienciaLaboral[]>([]);
    const [experienciasEliminadas, setExperienciasEliminadas] = useState<number[]>([]);
    const [expForm, setExpForm] = useState(emptyExp());
    const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);

    const [educaciones, setEducaciones] = useState<Educacion[]>([]);
    const [educacionesEliminadas, setEducacionesEliminadas] = useState<number[]>([]);
    const [eduForm, setEduForm] = useState(emptyEdu());
    const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);

    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [idiomasEliminados, setIdiomasEliminados] = useState<number[]>([]);
    const [idiomaForm, setIdiomaForm] = useState(emptyIdioma());
    const [editingIdiomaIndex, setEditingIdiomaIndex] = useState<number | null>(null);

    const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
    const [certificacionesEliminadas, setCertificacionesEliminadas] = useState<number[]>([]);
    const [certForm, setCertForm] = useState(emptyCert());
    const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);

    // Form para CV
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm({
        resolver: zodResolver(cvSchema),
        defaultValues: editingCV || {
            titulo_profesional: '',
            resumen_profesional: '',
            nivel_educacion: '',
            anios_experiencia: 0,
            sector_profesional: '',
            email: '',
            telefono: '',
            linkedin_url: '',
            github_url: '',
            portfolio_url: '',
            ciudad: '',
            pais: '',
            disponibilidad: '',
            modalidad_trabajo: '',
        },
    });

    // Form para Habilidad
    const {
        register: registerHabilidad,
        handleSubmit: handleSubmitHabilidad,
        formState: { errors: errorsHabilidad },
        setValue: setValueHabilidad,
        watch: watchHabilidad,
        reset: resetHabilidad,
    } = useForm<z.infer<typeof habilidadSchema>>({
        resolver: zodResolver(habilidadSchema),
        defaultValues: {
            nombre: '',
            categoria: '',
            nivel: 'Básico' as const,
            anios_experiencia: 0,
        },
    });

    useEffect(() => {
        if (open && scrollTo === 'contacto') {
            setActiveTab('informacion');
            setTimeout(() => {
                if (contactoRef.current) {
                    const scrollContainer = contactoRef.current.closest('.overflow-y-auto');
                    if (scrollContainer) {
                        scrollContainer.scrollTo({ top: contactoRef.current.offsetTop - 16, behavior: 'smooth' });
                    } else {
                        contactoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 200);
        }
    }, [open, scrollTo]);

    useEffect(() => {
        if (editingCV) {
            reset({
                titulo_profesional: editingCV.titulo_profesional || '',
                resumen_profesional: editingCV.resumen_profesional || '',
                nivel_educacion: editingCV.nivel_educacion || '',
                anios_experiencia: Number(editingCV.anios_experiencia) || 0,
                sector_profesional: editingCV.sector_profesional || '',
                email: editingCV.email || '',
                telefono: editingCV.telefono || '',
                linkedin_url: editingCV.linkedin_url || '',
                github_url: editingCV.github_url || '',
                portfolio_url: editingCV.portfolio_url || '',
                ciudad: editingCV.ciudad || '',
                pais: editingCV.pais || '',
                disponibilidad: editingCV.disponibilidad || '',
                modalidad_trabajo: editingCV.modalidad_trabajo || '',
            });

            // Load sub-sections if editing existing CV
            if (editingCV.id) {
                loadSubSections(editingCV.id);
            }
        }
        if (habilidadesIniciales.length > 0) {
            setHabilidades(habilidadesIniciales);
        }
    }, [editingCV]);

    useEffect(() => {
        fetchUserData();
    }, [authUser?.id]);

    const loadSubSections = async (cvId: number) => {
        try {
            const [exps, edus, idms, certs] = await Promise.all([
                ExperienciaService.listarPorCV(cvId).catch(() => []),
                EducacionService.listarPorCV(cvId).catch(() => []),
                IdiomaService.listarPorCV(cvId).catch(() => []),
                CertificacionService.listarPorCV(cvId).catch(() => []),
            ]);
            setExperiencias(exps || []);
            setEducaciones(edus || []);
            setIdiomas(idms || []);
            setCertificaciones(certs || []);
        } catch (err) {
            console.error('Error cargando sub-secciones:', err);
        }
    };

    const fetchUserData = async () => {
        if (authUser?.id) {
            try {
                const data = await UserService.obtenerPersonaPorUsuario(authUser.id);
                setUserData(data);
            } catch (error) {
                console.error('Error cargando datos de persona en CV: ', error);
            }
        }
    };

    const onSubmitCV = async (data: any) => {
        setIsSubmitting(true);
        try {
            let cvResponse;
            const personaId = userData?.id_persona;

            if (!personaId && !editingCV) {
                toast.error('Error: No se pudo obtener el ID del usuario');
                return;
            }

            if (editingCV) {
                cvResponse = await CVService.actualizarCV(editingCV.id, {
                    ...data,
                    persona_id: editingCV.persona_id,
                });
            } else {
                cvResponse = await CVService.crearCV({
                    ...data,
                    persona_id: personaId,
                    estado: true,
                });
            }

            const cvId = cvResponse.id || editingCV?.id;

            // Delete removed items across all sections in parallel
            await Promise.all([
                ...habilidadesEliminadas.map(id => HabilidadService.eliminarHabilidad(id).catch(() => {})),
                ...experienciasEliminadas.map(id => ExperienciaService.eliminar(id).catch(() => {})),
                ...educacionesEliminadas.map(id => EducacionService.eliminar(id).catch(() => {})),
                ...idiomasEliminados.map(id => IdiomaService.eliminar(id).catch(() => {})),
                ...certificacionesEliminadas.map(id => CertificacionService.eliminar(id).catch(() => {})),
            ]);

            // Save all items across all sections in parallel
            await Promise.all([
                ...habilidades.map(h => h.id
                    ? HabilidadService.actualizarHabilidad(h.id, { nombre: h.nombre, categoria: h.categoria, nivel: h.nivel, anios_experiencia: h.anios_experiencia, id_cv: cvId })
                    : HabilidadService.crearHabilidad({ nombre: h.nombre, categoria: h.categoria, nivel: h.nivel, anios_experiencia: h.anios_experiencia, id_cv: cvId } as any)
                ),
                ...experiencias.map(exp => exp.id
                    ? ExperienciaService.actualizar(exp.id, { ...exp, id_cv: cvId })
                    : ExperienciaService.crear({ ...exp, id_cv: cvId })
                ),
                ...educaciones.map(edu => edu.id
                    ? EducacionService.actualizar(edu.id, { ...edu, id_cv: cvId })
                    : EducacionService.crear({ ...edu, id_cv: cvId })
                ),
                ...idiomas.map(idioma => idioma.id
                    ? IdiomaService.actualizar(idioma.id, { ...idioma, id_cv: cvId })
                    : IdiomaService.crear({ ...idioma, id_cv: cvId })
                ),
                ...certificaciones.map(cert => cert.id
                    ? CertificacionService.actualizar(cert.id, { ...cert, id_cv: cvId })
                    : CertificacionService.crear({ ...cert, id_cv: cvId })
                ),
            ]);

            if (onSubmit) {
                onSubmit(editingCV || cvResponse, habilidades);
            }

            setHabilidadesEliminadas([]);
            setExperienciasEliminadas([]);
            setEducacionesEliminadas([]);
            setIdiomasEliminados([]);
            setCertificacionesEliminadas([]);

            toast.success(editingCV ? 'CV Actualizado exitosamente' : 'CV Creado exitosamente');
        } catch (error) {
            console.log('Error al guardar el CV: ', error);
            toast.error('Error al guardar el currículum');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitHabilidad = (data: any) => {
        if (editingHabilidadIndex !== null) {
            const updated = [...habilidades];
            updated[editingHabilidadIndex] = { ...updated[editingHabilidadIndex], ...data };
            setHabilidades(updated);
            setEditingHabilidadIndex(null);
        } else {
            setHabilidades([...habilidades, { ...data, tempId: `temp-${Date.now()}` }]);
        }
        resetHabilidad();
    };

    const handleEditHabilidad = (index: number) => {
        const h = habilidades[index];
        setValueHabilidad('nombre', h.nombre);
        setValueHabilidad('categoria', h.categoria);
        setValueHabilidad('nivel', h.nivel as any);
        setValueHabilidad('anios_experiencia', Number(h.anios_experiencia));
        setEditingHabilidadIndex(index);
        setActiveTab('habilidades');
    };

    const handleDeleteHabilidad = (index: number) => {
        const h = habilidades[index];
        if (h.id) setHabilidadesEliminadas([...habilidadesEliminadas, h.id]);
        setHabilidades(habilidades.filter((_, i) => i !== index));
    };

    const handleCancelEditHabilidad = () => {
        resetHabilidad();
        setEditingHabilidadIndex(null);
    };

    // ── Experiencia handlers ──
    const handleAddExp = () => {
        if (!expForm.empresa || !expForm.cargo || !expForm.fecha_inicio) {
            toast.error('Empresa, Cargo y Fecha de inicio son obligatorios');
            return;
        }
        if (editingExpIndex !== null) {
            const updated = [...experiencias];
            updated[editingExpIndex] = { ...updated[editingExpIndex], ...expForm };
            setExperiencias(updated);
            setEditingExpIndex(null);
        } else {
            setExperiencias([...experiencias, { ...expForm, id_cv: editingCV?.id || 0 } as ExperienciaLaboral]);
        }
        setExpForm(emptyExp());
    };

    const handleDeleteExp = (index: number) => {
        const exp = experiencias[index];
        if (exp.id) setExperienciasEliminadas([...experienciasEliminadas, exp.id]);
        setExperiencias(experiencias.filter((_, i) => i !== index));
    };

    // ── Educacion handlers ──
    const handleAddEdu = () => {
        if (!eduForm.institucion || !eduForm.titulo || !eduForm.nivel || !eduForm.fecha_inicio) {
            toast.error('Institución, Título, Nivel y Fecha de inicio son obligatorios');
            return;
        }
        if (editingEduIndex !== null) {
            const updated = [...educaciones];
            updated[editingEduIndex] = { ...updated[editingEduIndex], ...eduForm };
            setEducaciones(updated);
            setEditingEduIndex(null);
        } else {
            setEducaciones([...educaciones, { ...eduForm, id_cv: editingCV?.id || 0 } as Educacion]);
        }
        setEduForm(emptyEdu());
    };

    const handleDeleteEdu = (index: number) => {
        const edu = educaciones[index];
        if (edu.id) setEducacionesEliminadas([...educacionesEliminadas, edu.id]);
        setEducaciones(educaciones.filter((_, i) => i !== index));
    };

    // ── Idioma handlers ──
    const handleAddIdioma = () => {
        if (!idiomaForm.nombre || !idiomaForm.nivel) {
            toast.error('Nombre y nivel del idioma son obligatorios');
            return;
        }
        if (editingIdiomaIndex !== null) {
            const updated = [...idiomas];
            updated[editingIdiomaIndex] = { ...updated[editingIdiomaIndex], ...idiomaForm };
            setIdiomas(updated);
            setEditingIdiomaIndex(null);
        } else {
            setIdiomas([...idiomas, { ...idiomaForm, id_cv: editingCV?.id || 0 } as Idioma]);
        }
        setIdiomaForm(emptyIdioma());
    };

    const handleDeleteIdioma = (index: number) => {
        const idioma = idiomas[index];
        if (idioma.id) setIdiomasEliminados([...idiomasEliminados, idioma.id]);
        setIdiomas(idiomas.filter((_, i) => i !== index));
    };

    // ── Certificacion handlers ──
    const handleAddCert = () => {
        if (!certForm.nombre) {
            toast.error('El nombre de la certificación es obligatorio');
            return;
        }
        if (editingCertIndex !== null) {
            const updated = [...certificaciones];
            updated[editingCertIndex] = { ...updated[editingCertIndex], ...certForm };
            setCertificaciones(updated);
            setEditingCertIndex(null);
        } else {
            setCertificaciones([...certificaciones, { ...certForm, id_cv: editingCV?.id || 0 } as Certificacion]);
        }
        setCertForm(emptyCert());
    };

    const handleDeleteCert = (index: number) => {
        const cert = certificaciones[index];
        if (cert.id) setCertificacionesEliminadas([...certificacionesEliminadas, cert.id]);
        setCertificaciones(certificaciones.filter((_, i) => i !== index));
    };

    const getNivelColor = (nivel: string) => {
        const colores: Record<string, string> = {
            Básico: 'bg-blue-100 text-blue-700 border-blue-200',
            Intermedio: 'bg-green-100 text-green-700 border-green-200',
            Avanzado: 'bg-purple-100 text-purple-700 border-purple-200',
            Experto: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colores[nivel] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b pb-4 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 -mt-6 px-6 pt-6 mb-4">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl">{editingCV ? 'Editar Currículum Vitae' : 'Crear Currículum Vitae'}</div>
                            <p className="text-sm font-normal text-gray-600 mt-1">
                                {editingCV
                                    ? 'Modifica tu información profesional y habilidades'
                                    : 'Completa tu perfil profesional para destacar en el mercado laboral'}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="grid w-full grid-cols-5 mb-4 bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger value="informacion" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                            <Briefcase className="h-3 w-3" />
                            Info
                        </TabsTrigger>
                        <TabsTrigger value="habilidades" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                            <Award className="h-3 w-3" />
                            Habilidades
                            {habilidades.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{habilidades.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="experiencia" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                            <Briefcase className="h-3 w-3" />
                            Experiencia
                            {experiencias.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{experiencias.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="educacion" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                            <GraduationCap className="h-3 w-3" />
                            Educación
                            {educaciones.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{educaciones.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="idiomas-certs" className="gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                            <Languages className="h-3 w-3" />
                            Idiomas/Certs
                        </TabsTrigger>
                    </TabsList>

                    <div className="overflow-y-auto max-h-[calc(90vh-260px)] pr-2">

                        {/* TAB 1: INFORMACIÓN GENERAL + CONTACTO */}
                        <TabsContent value="informacion" className="mt-0 space-y-5">
                            <form id="cv-form" onSubmit={handleSubmit(onSubmitCV, () => { setActiveTab('informacion'); toast.error('Hay errores en la pestaña "Info". Revísalos antes de guardar.'); })}>
                                {/* Título Profesional */}
                                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                <Briefcase className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <Label htmlFor="titulo_profesional" className="text-base font-semibold text-gray-900">
                                                    Título Profesional <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="titulo_profesional"
                                                    placeholder="ej. Ingeniero de Software Senior, Diseñador UX/UI"
                                                    className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                    {...register('titulo_profesional')}
                                                />
                                                {errors.titulo_profesional && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <X className="h-3 w-3" />{errors.titulo_profesional.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Resumen Profesional */}
                                <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <Label htmlFor="resumen_profesional" className="text-base font-semibold text-gray-900">
                                                    Resumen Profesional <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id="resumen_profesional"
                                                    placeholder="Describe tu experiencia, logros principales y objetivos profesionales..."
                                                    rows={5}
                                                    className="text-base resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    {...register('resumen_profesional')}
                                                />
                                                <div className="flex justify-between items-center">
                                                    {errors.resumen_profesional && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                                            <X className="h-3 w-3" />{errors.resumen_profesional.message}
                                                        </p>
                                                    )}
                                                    <p className={`text-xs ml-auto ${(watch('resumen_profesional')?.length || 0) >= 50 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                                        {watch('resumen_profesional')?.length || 0} caracteres (mín. 50)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Detalles Profesionales */}
                                <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/50 via-white to-green-50/30 hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                <GraduationCap className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-base font-semibold text-gray-900">Detalles Profesionales</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Nivel de Educación <span className="text-red-500">*</span></Label>
                                                        <Select
                                                            value={watch('nivel_educacion') || 'none'}
                                                            onValueChange={(value) => { if (value !== 'none') setValue('nivel_educacion', value); }}
                                                        >
                                                            <SelectTrigger className="border-gray-300 focus:border-green-500">
                                                                <SelectValue placeholder="Selecciona tu nivel" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none" disabled>Selecciona un nivel</SelectItem>
                                                                <SelectItem value="Secundaria">Secundaria</SelectItem>
                                                                <SelectItem value="Técnico">Técnico</SelectItem>
                                                                <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                                                                <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                                                                <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                                                                <SelectItem value="Maestría">Maestría</SelectItem>
                                                                <SelectItem value="Doctorado">Doctorado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.nivel_educacion && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errors.nivel_educacion.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Años de Experiencia <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            type="number" min="0" max="50" placeholder="0"
                                                            className="border-gray-300 focus:border-green-500"
                                                            {...register('anios_experiencia', { valueAsNumber: true })}
                                                        />
                                                        {errors.anios_experiencia && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errors.anios_experiencia.message}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Sector Profesional <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        placeholder="ej. Tecnología de la Información, Marketing Digital"
                                                        className="border-gray-300 focus:border-green-500"
                                                        {...register('sector_profesional')}
                                                    />
                                                    {errors.sector_profesional && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errors.sector_profesional.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información de Contacto */}
                                <div ref={contactoRef} className="scroll-mt-2">
                                <Card className="border-2 border-cyan-100 bg-gradient-to-br from-cyan-50/50 via-white to-cyan-50/30 hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                                <Phone className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-base font-semibold text-gray-900">Información de Contacto</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-cyan-600" /> Email de contacto</Label>
                                                        <Input placeholder="tu@email.com" type="email" className="border-gray-300 focus:border-cyan-500" {...register('email')} />
                                                        {errors.email && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errors.email.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-cyan-600" /> Teléfono</Label>
                                                        <Input placeholder="+593 99 999 9999" className="border-gray-300 focus:border-cyan-500" {...register('telefono')} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cyan-600" /> Ciudad</Label>
                                                        <Input placeholder="ej. Quito" className="border-gray-300 focus:border-cyan-500" {...register('ciudad')} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-cyan-600" /> País</Label>
                                                        <Input placeholder="ej. Ecuador" className="border-gray-300 focus:border-cyan-500" {...register('pais')} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><Linkedin className="h-3.5 w-3.5 text-cyan-600" /> LinkedIn URL</Label>
                                                        <Input placeholder="https://linkedin.com/in/..." className="border-gray-300 focus:border-cyan-500" {...register('linkedin_url')} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><Github className="h-3.5 w-3.5 text-cyan-600" /> GitHub URL</Label>
                                                        <Input placeholder="https://github.com/..." className="border-gray-300 focus:border-cyan-500" {...register('github_url')} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-cyan-600" /> Portfolio URL</Label>
                                                        <Input placeholder="https://miportfolio.com" className="border-gray-300 focus:border-cyan-500" {...register('portfolio_url')} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Disponibilidad</Label>
                                                        <Select
                                                            value={watch('disponibilidad') || 'none'}
                                                            onValueChange={(v) => { if (v !== 'none') setValue('disponibilidad', v); }}
                                                        >
                                                            <SelectTrigger className="border-gray-300 focus:border-cyan-500">
                                                                <SelectValue placeholder="Selecciona disponibilidad" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none" disabled>Selecciona</SelectItem>
                                                                <SelectItem value="Inmediata">Inmediata</SelectItem>
                                                                <SelectItem value="2 semanas">2 semanas</SelectItem>
                                                                <SelectItem value="1 mes">1 mes</SelectItem>
                                                                <SelectItem value="Negociable">Negociable</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Modalidad de Trabajo</Label>
                                                        <Select
                                                            value={watch('modalidad_trabajo') || 'none'}
                                                            onValueChange={(v) => { if (v !== 'none') setValue('modalidad_trabajo', v); }}
                                                        >
                                                            <SelectTrigger className="border-gray-300 focus:border-cyan-500">
                                                                <SelectValue placeholder="Selecciona modalidad" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none" disabled>Selecciona</SelectItem>
                                                                <SelectItem value="Presencial">Presencial</SelectItem>
                                                                <SelectItem value="Remoto">Remoto</SelectItem>
                                                                <SelectItem value="Híbrido">Híbrido</SelectItem>
                                                                <SelectItem value="Cualquiera">Cualquiera</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>
                            </form>
                        </TabsContent>

                        {/* TAB 2: HABILIDADES */}
                        <TabsContent value="habilidades" className="mt-0 space-y-5">
                            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <Plus className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold mb-4 text-gray-900">
                                                {editingHabilidadIndex !== null ? 'Editar Habilidad' : 'Agregar Nueva Habilidad'}
                                            </h3>
                                            <form onSubmit={handleSubmitHabilidad(onSubmitHabilidad)} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></Label>
                                                        <Input placeholder="ej. React.js, Photoshop" className="border-gray-300 focus:border-orange-500" {...registerHabilidad('nombre')} />
                                                        {errorsHabilidad.nombre && <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errorsHabilidad.nombre.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Categoría <span className="text-red-500">*</span></Label>
                                                        <Input placeholder="ej. Frontend, Diseño" className="border-gray-300 focus:border-orange-500" {...registerHabilidad('categoria')} />
                                                        {errorsHabilidad.categoria && <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errorsHabilidad.categoria.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Nivel <span className="text-red-500">*</span></Label>
                                                        <Select value={watchHabilidad('nivel')} onValueChange={(v) => setValueHabilidad('nivel', v as any)}>
                                                            <SelectTrigger className="border-gray-300 focus:border-orange-500"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Básico">Básico</SelectItem>
                                                                <SelectItem value="Intermedio">Intermedio</SelectItem>
                                                                <SelectItem value="Avanzado">Avanzado</SelectItem>
                                                                <SelectItem value="Experto">Experto</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errorsHabilidad.nivel && <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errorsHabilidad.nivel.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Años de Experiencia <span className="text-red-500">*</span></Label>
                                                        <Input type="number" min="0" max="50" placeholder="0" className="border-gray-300 focus:border-orange-500"
                                                            {...registerHabilidad('anios_experiencia', { valueAsNumber: true })} />
                                                        {errorsHabilidad.anios_experiencia && <p className="text-sm text-red-500 flex items-center gap-1"><X className="h-3 w-3" />{errorsHabilidad.anios_experiencia.message}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    {editingHabilidadIndex !== null && (
                                                        <Button type="button" variant="outline" onClick={handleCancelEditHabilidad} className="flex-1">Cancelar</Button>
                                                    )}
                                                    <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        {editingHabilidadIndex !== null ? 'Actualizar' : 'Agregar'} Habilidad
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                                    <Award className="h-5 w-5 text-purple-600" />
                                    Mis Habilidades
                                    {habilidades.length > 0 && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">{habilidades.length}</span>}
                                </h3>
                                {habilidades.length === 0 ? (
                                    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                                        <CardContent className="py-8 text-center">
                                            <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No has agregado habilidades aún</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {habilidades.map((h, index) => (
                                            <Card key={h.id || (h as any).tempId || index} className="border-2 border-gray-200 hover:border-purple-300 transition-all bg-white">
                                                <CardContent className="pt-4 pb-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{h.nombre}</p>
                                                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 mt-1">{h.categoria}</Badge>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => handleEditHabilidad(index)}>
                                                                <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDeleteHabilidad(index)}>
                                                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <Badge className={`${getNivelColor(h.nivel)} border text-xs px-2 py-0.5`}>{h.nivel}</Badge>
                                                    <p className="text-xs text-gray-500 mt-1">{h.anios_experiencia} año(s) de experiencia</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 3: EXPERIENCIA LABORAL */}
                        <TabsContent value="experiencia" className="mt-0 space-y-5">
                            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/50 via-white to-green-50/30 hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <Briefcase className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {editingExpIndex !== null ? 'Editar Experiencia' : 'Agregar Experiencia Laboral'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Empresa <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="ej. Google, Startup XYZ" value={expForm.empresa}
                                                        onChange={(e) => setExpForm({ ...expForm, empresa: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Cargo <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="ej. Desarrollador Backend" value={expForm.cargo}
                                                        onChange={(e) => setExpForm({ ...expForm, cargo: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha Inicio <span className="text-red-500">*</span></Label>
                                                    <Input type="month" value={expForm.fecha_inicio}
                                                        onChange={(e) => setExpForm({ ...expForm, fecha_inicio: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha Fin</Label>
                                                    <Input type="month" value={expForm.fecha_fin || ''} disabled={expForm.es_trabajo_actual}
                                                        onChange={(e) => setExpForm({ ...expForm, fecha_fin: e.target.value })} />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-sm font-medium">Descripción</Label>
                                                    <Textarea placeholder="Describe tus responsabilidades y logros..." rows={3}
                                                        value={expForm.descripcion || ''}
                                                        onChange={(e) => setExpForm({ ...expForm, descripcion: e.target.value })} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" id="es_trabajo_actual" className="rounded" checked={expForm.es_trabajo_actual}
                                                        onChange={(e) => setExpForm({ ...expForm, es_trabajo_actual: e.target.checked, fecha_fin: e.target.checked ? '' : expForm.fecha_fin })} />
                                                    <Label htmlFor="es_trabajo_actual" className="text-sm cursor-pointer">Trabajo actual</Label>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingExpIndex !== null && (
                                                    <Button type="button" variant="outline" onClick={() => { setEditingExpIndex(null); setExpForm(emptyExp()); }} className="flex-1">Cancelar</Button>
                                                )}
                                                <Button type="button" onClick={handleAddExp} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {editingExpIndex !== null ? 'Actualizar' : 'Agregar'} Experiencia
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                                    <Briefcase className="h-5 w-5 text-green-600" />
                                    Experiencias Registradas
                                    {experiencias.length > 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">{experiencias.length}</span>}
                                </h3>
                                {experiencias.length === 0 ? (
                                    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                                        <CardContent className="py-8 text-center">
                                            <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No has agregado experiencias aún</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {experiencias.map((exp, index) => (
                                            <Card key={exp.id || index} className="border-2 border-gray-200 hover:border-green-300 transition-all bg-white">
                                                <CardContent className="pt-4 pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-bold text-gray-900">{exp.cargo}</p>
                                                                {exp.es_trabajo_actual && <Badge className="bg-green-100 text-green-700 text-xs">Actual</Badge>}
                                                            </div>
                                                            <p className="text-sm text-gray-600 font-medium">{exp.empresa}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {exp.fecha_inicio} — {exp.es_trabajo_actual ? 'Presente' : (exp.fecha_fin || 'No especificado')}
                                                            </p>
                                                            {exp.descripcion && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{exp.descripcion}</p>}
                                                        </div>
                                                        <div className="flex gap-1 ml-2">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => { setExpForm({ ...exp }); setEditingExpIndex(index); }}>
                                                                <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDeleteExp(index)}>
                                                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 4: EDUCACIÓN */}
                        <TabsContent value="educacion" className="mt-0 space-y-5">
                            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <GraduationCap className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {editingEduIndex !== null ? 'Editar Educación' : 'Agregar Educación'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Institución <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="ej. Universidad de..." value={eduForm.institucion}
                                                        onChange={(e) => setEduForm({ ...eduForm, institucion: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Título <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="ej. Ingeniería en Sistemas" value={eduForm.titulo}
                                                        onChange={(e) => setEduForm({ ...eduForm, titulo: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Nivel <span className="text-red-500">*</span></Label>
                                                    <Select value={eduForm.nivel || 'none'} onValueChange={(v) => { if (v !== 'none') setEduForm({ ...eduForm, nivel: v }); }}>
                                                        <SelectTrigger><SelectValue placeholder="Selecciona nivel" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none" disabled>Selecciona</SelectItem>
                                                            <SelectItem value="Técnico">Técnico</SelectItem>
                                                            <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                                                            <SelectItem value="Universitario">Universitario</SelectItem>
                                                            <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                                                            <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                                                            <SelectItem value="Maestría">Maestría</SelectItem>
                                                            <SelectItem value="Doctorado">Doctorado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha Inicio <span className="text-red-500">*</span></Label>
                                                    <Input type="month" value={eduForm.fecha_inicio}
                                                        onChange={(e) => setEduForm({ ...eduForm, fecha_inicio: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha Fin</Label>
                                                    <Input type="month" value={eduForm.fecha_fin || ''} disabled={eduForm.en_curso}
                                                        onChange={(e) => setEduForm({ ...eduForm, fecha_fin: e.target.value })} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" id="en_curso" className="rounded" checked={eduForm.en_curso}
                                                        onChange={(e) => setEduForm({ ...eduForm, en_curso: e.target.checked, fecha_fin: e.target.checked ? '' : eduForm.fecha_fin })} />
                                                    <Label htmlFor="en_curso" className="text-sm cursor-pointer">En curso</Label>
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-sm font-medium">Descripción (opcional)</Label>
                                                    <Textarea placeholder="Actividades relevantes, proyectos de tesis, etc." rows={2}
                                                        value={eduForm.descripcion || ''}
                                                        onChange={(e) => setEduForm({ ...eduForm, descripcion: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingEduIndex !== null && (
                                                    <Button type="button" variant="outline" onClick={() => { setEditingEduIndex(null); setEduForm(emptyEdu()); }} className="flex-1">Cancelar</Button>
                                                )}
                                                <Button type="button" onClick={handleAddEdu} className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {editingEduIndex !== null ? 'Actualizar' : 'Agregar'} Educación
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                                    <GraduationCap className="h-5 w-5 text-purple-600" />
                                    Educación Registrada
                                    {educaciones.length > 0 && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">{educaciones.length}</span>}
                                </h3>
                                {educaciones.length === 0 ? (
                                    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                                        <CardContent className="py-8 text-center">
                                            <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No has agregado educación aún</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {educaciones.map((edu, index) => (
                                            <Card key={edu.id || index} className="border-2 border-gray-200 hover:border-purple-300 transition-all bg-white">
                                                <CardContent className="pt-4 pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-bold text-gray-900">{edu.titulo}</p>
                                                                {edu.en_curso && <Badge className="bg-purple-100 text-purple-700 text-xs">En curso</Badge>}
                                                            </div>
                                                            <p className="text-sm text-gray-600 font-medium">{edu.institucion}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                <Badge variant="secondary" className="text-xs">{edu.nivel}</Badge>
                                                                <span className="text-xs text-gray-400">{edu.fecha_inicio} — {edu.en_curso ? 'Presente' : (edu.fecha_fin || '')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 ml-2">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => { setEduForm({ ...edu }); setEditingEduIndex(index); }}>
                                                                <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDeleteEdu(index)}>
                                                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 5: IDIOMAS Y CERTIFICACIONES */}
                        <TabsContent value="idiomas-certs" className="mt-0 space-y-5">
                            {/* IDIOMAS */}
                            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <Languages className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {editingIdiomaIndex !== null ? 'Editar Idioma' : 'Agregar Idioma'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Idioma <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="ej. Español, Inglés, Francés" value={idiomaForm.nombre}
                                                        onChange={(e) => setIdiomaForm({ ...idiomaForm, nombre: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Nivel <span className="text-red-500">*</span></Label>
                                                    <Select value={idiomaForm.nivel || 'none'} onValueChange={(v) => { if (v !== 'none') setIdiomaForm({ ...idiomaForm, nivel: v }); }}>
                                                        <SelectTrigger><SelectValue placeholder="Selecciona nivel" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none" disabled>Selecciona</SelectItem>
                                                            <SelectItem value="Nativo">Nativo</SelectItem>
                                                            <SelectItem value="Avanzado">Avanzado</SelectItem>
                                                            <SelectItem value="Intermedio">Intermedio</SelectItem>
                                                            <SelectItem value="Básico">Básico</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingIdiomaIndex !== null && (
                                                    <Button type="button" variant="outline" onClick={() => { setEditingIdiomaIndex(null); setIdiomaForm(emptyIdioma()); }} className="flex-1">Cancelar</Button>
                                                )}
                                                <Button type="button" onClick={handleAddIdioma} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {editingIdiomaIndex !== null ? 'Actualizar' : 'Agregar'} Idioma
                                                </Button>
                                            </div>

                                            {idiomas.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                                    {idiomas.map((idioma, index) => (
                                                        <div key={idioma.id || index} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                                                            <Languages className="h-3.5 w-3.5 text-blue-600" />
                                                            <span className="text-sm font-medium text-blue-800">{idioma.nombre}</span>
                                                            <span className="text-xs text-blue-600">— {idioma.nivel}</span>
                                                            <button onClick={() => handleDeleteIdioma(index)} className="ml-1 text-blue-400 hover:text-red-500 transition-colors">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CERTIFICACIONES */}
                            <Card className="border-2 border-yellow-100 bg-gradient-to-br from-yellow-50/50 via-white to-yellow-50/30 hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <BadgeCheck className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {editingCertIndex !== null ? 'Editar Certificación' : 'Agregar Certificación'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="ej. AWS Solutions Architect" value={certForm.nombre}
                                                        onChange={(e) => setCertForm({ ...certForm, nombre: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Emisor</Label>
                                                    <Input placeholder="ej. Amazon, Google, Coursera" value={certForm.emisor || ''}
                                                        onChange={(e) => setCertForm({ ...certForm, emisor: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fecha</Label>
                                                    <Input type="month" value={certForm.fecha || ''}
                                                        onChange={(e) => setCertForm({ ...certForm, fecha: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">URL Credencial</Label>
                                                    <Input placeholder="https://..." value={certForm.url_credencial || ''}
                                                        onChange={(e) => setCertForm({ ...certForm, url_credencial: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {editingCertIndex !== null && (
                                                    <Button type="button" variant="outline" onClick={() => { setEditingCertIndex(null); setCertForm(emptyCert()); }} className="flex-1">Cancelar</Button>
                                                )}
                                                <Button type="button" onClick={handleAddCert} className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {editingCertIndex !== null ? 'Actualizar' : 'Agregar'} Certificación
                                                </Button>
                                            </div>

                                            {certificaciones.length > 0 && (
                                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                                    {certificaciones.map((cert, index) => (
                                                        <div key={cert.id || index} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <BadgeCheck className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{cert.nombre}</p>
                                                                    {cert.emisor && <p className="text-xs text-gray-500">{cert.emisor}{cert.fecha ? ` · ${cert.fecha}` : ''}</p>}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 ml-2">
                                                                <button onClick={() => { setCertForm({ ...cert }); setEditingCertIndex(index); }} className="text-blue-400 hover:text-blue-600 transition-colors p-1">
                                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button onClick={() => handleDeleteCert(index)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </div>
                </Tabs>

                <DialogFooter className="border-t pt-4 mt-2 bg-gray-50/50 -mx-6 -mb-6 px-6 pb-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="hover:bg-gray-100">
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmitCV, () => { setActiveTab('informacion'); toast.error('Hay errores en la pestaña "Info". Revísalos antes de guardar.'); })}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                        ) : (
                            <>{editingCV ? 'Actualizar CV' : 'Crear CV'}</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
