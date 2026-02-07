import { useState, useEffect } from 'react';
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
import { Plus, Trash2, Briefcase, Award, GraduationCap, X, Loader2 } from 'lucide-react';
import type { HabilidadData } from '../types/HabilidadType';
import { CVService } from '../services/CVService';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { UserService } from '@/modules/users/services/UserService';
import { HabilidadService } from '../services/HabilidadService';

// Schema de validación
const cvSchema = z.object({
    titulo_profesional: z.string().min(3, 'El título profesional debe tener al menos 3 caracteres'),
    resumen_profesional: z.string().min(50, 'El resumen debe tener al menos 50 caracteres'),
    nivel_educacion: z.string().min(1, 'Selecciona un nivel de educación'),
    anios_experiencia: z.number().min(0, 'Los años de experiencia no pueden ser negativos'),
    sector_profesional: z.string().min(3, 'El sector profesional es requerido'),
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
}

export const CVDialog = ({
    open,
    onOpenChange,
    editingCV,
    habilidadesIniciales = [],
    onSubmit,
}: CVDialogProps) => {
    const [activeTab, setActiveTab] = useState('informacion');
    const [habilidades, setHabilidades] = useState<HabilidadData[]>(habilidadesIniciales);
    const [habilidadesEliminadas, setHabilidadesEliminadas] = useState<number[]>([]);
    const [userData, setUserData] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const [editingHabilidadIndex, setEditingHabilidadIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (editingCV) {
            reset(editingCV);
        }
        if (habilidadesIniciales.length > 0) {
            setHabilidades(habilidadesIniciales);
        }

        fectchUserData();
    }, [editingCV, habilidadesIniciales, reset, authUser]);

    const fectchUserData = async () => {
        if (authUser?.id) {
            try {
                const data = await UserService.obtenerPersonaPorUsuario(authUser.id);
                setUserData(data)
            } catch (error) {
                console.error("Error cargando datos de persona en CV: ", error);
            }
        }
    }

    const onSubmitCV = async (data: any) => {
        setIsSubmitting(true);

        // Guardar los datos validando si es nuevo registro o registro anterior
        try {
            let cvResponse;

            const personaId = userData?.id_persona;

            if (!personaId && !editingCV) {
                toast.error('Error: No se pudo obtener el ID del usuario');
                return;
            }

            if (editingCV) {
                // Modo edición
                cvResponse = await CVService.actualizarCV(editingCV.id, {
                    ...data,
                    persona_id: editingCV.persona_id,
                });
            } else {
                // Modo creación
                cvResponse = await CVService.crearCV({
                    ...data,
                    persona_id: personaId,
                    estado: true
                });
            }

            const cvId = cvResponse.id || editingCV?.id;

            // 1. ELIMINAR habilidades borradas
            for (const idEliminado of habilidadesEliminadas) {
                await HabilidadService.eliminarHabilidad(idEliminado);
            }

            // 2. ACTUALIZAR o CREAR habilidades existentes
            for (const habilidad of habilidades) {
                if (habilidad.id) {
                    // Actualizar habilidad existente
                    await HabilidadService.actualizarHabilidad(habilidad.id, {
                        nombre: habilidad.nombre,
                        categoria: habilidad.categoria,
                        nivel: habilidad.nivel,
                        anios_experiencia: habilidad.anios_experiencia,
                        id_cv: cvId
                    });
                } else {
                    // Crear nueva habilidad
                    await HabilidadService.crearHabilidad({
                        nombre: habilidad.nombre,
                        categoria: habilidad.categoria,
                        nivel: habilidad.nivel,
                        anios_experiencia: habilidad.anios_experiencia,
                        id_cv: cvId
                    } as any);
                }
            }

            // Llamar callback de éxito
            if (onSubmit) {
                onSubmit(editingCV || cvResponse, habilidades);
            }

            // Limpiar estados
            setHabilidadesEliminadas([]);

            toast.success(editingCV ? 'CV Actualizado exitosamente' : 'CV Creado exitosamente')
        } catch (error) {
            console.log('Error al guardar el CV: ', error);
            toast.error('Error al guardar el currículum');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitHabilidad = (data: any) => {
        if (editingHabilidadIndex !== null) {
            // Editar habilidad existente
            const updatedHabilidades = [...habilidades];
            updatedHabilidades[editingHabilidadIndex] = {
                ...updatedHabilidades[editingHabilidadIndex],
                ...data,
            };
            setHabilidades(updatedHabilidades);
            setEditingHabilidadIndex(null);
        } else {
            // Agregar nueva habilidad
            setHabilidades([
                ...habilidades,
                {
                    ...data,
                    tempId: `temp-${Date.now()}`,
                },
            ]);
        }
        resetHabilidad();
    };

    const handleEditHabilidad = (index: number) => {
        const habilidad = habilidades[index];
        setValueHabilidad('nombre', habilidad.nombre);
        setValueHabilidad('categoria', habilidad.categoria);
        setValueHabilidad('nivel', habilidad.nivel as any);
        setValueHabilidad('anios_experiencia', Number(habilidad.anios_experiencia));
        setEditingHabilidadIndex(index);
        setActiveTab('habilidades');
    };

    const handleDeleteHabilidad = (index: number) => {
        const habilidadEliminada = habilidades[index];

        // Si la habilidad tiene ID (existe en BD), guardar su ID para eliminarla
        if (habilidadEliminada.id) {
            setHabilidadesEliminadas([...habilidadesEliminadas, habilidadEliminada.id]);
        }

        setHabilidades(habilidades.filter((_, i) => i !== index));
    };

    const handleCancelEditHabilidad = () => {
        resetHabilidad();
        setEditingHabilidadIndex(null);
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
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger
                            value="informacion"
                            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                        >
                            <Briefcase className="h-4 w-4" />
                            Información General
                        </TabsTrigger>
                        <TabsTrigger
                            value="habilidades"
                            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                        >
                            <Award className="h-4 w-4" />
                            Habilidades
                            {habilidades.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    {habilidades.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {/* TAB 1: INFORMACIÓN GENERAL */}
                        <TabsContent value="informacion" className="mt-0 space-y-5">
                            <form id="cv-form" onSubmit={handleSubmit(onSubmitCV)}>
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
                                                    <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                        <X className="h-3 w-3" />
                                                        {errors.titulo_profesional.message}
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
                                                    placeholder="Describe tu experiencia, logros principales y objetivos profesionales. Sé específico y destaca lo que te hace único..."
                                                    rows={6}
                                                    className="text-base resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    {...register('resumen_profesional')}
                                                />
                                                <div className="flex justify-between items-center">
                                                    {errors.resumen_profesional && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                            <X className="h-3 w-3" />
                                                            {errors.resumen_profesional.message}
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
                                                    {/* Nivel de Educación */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="nivel_educacion" className="text-sm font-medium">
                                                            Nivel de Educación <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={watch('nivel_educacion') || 'none'}
                                                            onValueChange={(value) => {
                                                                if (value !== 'none') {
                                                                    setValue('nivel_educacion', value);
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                                <SelectValue placeholder="Selecciona tu nivel" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none" disabled>Selecciona un nivel</SelectItem>
                                                                <SelectItem value="Secundaria">📚 Secundaria</SelectItem>
                                                                <SelectItem value="Técnico">🔧 Técnico</SelectItem>
                                                                <SelectItem value="Tecnólogo">💻 Tecnólogo</SelectItem>
                                                                <SelectItem value="Licenciatura">🎓 Licenciatura</SelectItem>
                                                                <SelectItem value="Ingeniería">⚙️ Ingeniería</SelectItem>
                                                                <SelectItem value="Maestría">🎯 Maestría</SelectItem>
                                                                <SelectItem value="Doctorado">🏆 Doctorado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.nivel_educacion && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                <X className="h-3 w-3" />
                                                                {errors.nivel_educacion.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Años de Experiencia */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="anios_experiencia" className="text-sm font-medium">
                                                            Años de Experiencia <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="anios_experiencia"
                                                            type="number"
                                                            min="0"
                                                            max="50"
                                                            placeholder="0"
                                                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                            {...register('anios_experiencia', { valueAsNumber: true })}
                                                        />
                                                        {errors.anios_experiencia && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                <X className="h-3 w-3" />
                                                                {errors.anios_experiencia.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Sector Profesional */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="sector_profesional" className="text-sm font-medium">
                                                        Sector Profesional <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="sector_profesional"
                                                        placeholder="ej. Tecnología de la Información, Marketing Digital, Finanzas"
                                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                        {...register('sector_profesional')}
                                                    />
                                                    {errors.sector_profesional && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                            <X className="h-3 w-3" />
                                                            {errors.sector_profesional.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </TabsContent>

                        {/* TAB 2: HABILIDADES */}
                        <TabsContent value="habilidades" className="mt-0 space-y-5">
                            {/* Formulario de Habilidad */}
                            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <Plus className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold mb-4 text-gray-900">
                                                {editingHabilidadIndex !== null ? '✏️ Editar Habilidad' : '➕ Agregar Nueva Habilidad'}
                                            </h3>

                                            <form onSubmit={handleSubmitHabilidad(onSubmitHabilidad)} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Nombre */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="nombre" className="text-sm font-medium">
                                                            Nombre de la Habilidad <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="nombre"
                                                            placeholder="ej. React.js, Photoshop, SEO"
                                                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                                            {...registerHabilidad('nombre')}
                                                        />
                                                        {errorsHabilidad.nombre && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                <X className="h-3 w-3" />
                                                                {errorsHabilidad.nombre.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Categoría */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="categoria" className="text-sm font-medium">
                                                            Categoría <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="categoria"
                                                            placeholder="ej. Frontend, Diseño, Marketing"
                                                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                                            {...registerHabilidad('categoria')}
                                                        />
                                                        {errorsHabilidad.categoria && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                <X className="h-3 w-3" />
                                                                {errorsHabilidad.categoria.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Nivel */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="nivel" className="text-sm font-medium">
                                                            Nivel de Dominio <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={watchHabilidad('nivel')}
                                                            onValueChange={(value) => setValueHabilidad('nivel', value as any)}
                                                        >
                                                            <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Básico">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                        <span>Básico</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="Intermedio">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                        <span>Intermedio</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="Avanzado">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                                                        <span>Avanzado</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="Experto">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                                        <span>Experto</span>
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errorsHabilidad.nivel && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                <X className="h-3 w-3" />
                                                                {errorsHabilidad.nivel.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Años de Experiencia */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="anios_experiencia_hab" className="text-sm font-medium">
                                                            Años de Experiencia <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="anios_experiencia_hab"
                                                            type="number"
                                                            min="0"
                                                            max="50"
                                                            placeholder="0"
                                                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                                            {...registerHabilidad('anios_experiencia', { valueAsNumber: true })}
                                                        />
                                                        {errorsHabilidad.anios_experiencia && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                                <X className="h-3 w-3" />
                                                                {errorsHabilidad.anios_experiencia.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    {editingHabilidadIndex !== null && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleCancelEditHabilidad}
                                                            className="flex-1 hover:bg-gray-100"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="submit"
                                                        className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        {editingHabilidadIndex !== null ? 'Actualizar' : 'Agregar'} Habilidad
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">Habilidades registradas</span>
                                </div>
                            </div>

                            {/* Lista de Habilidades */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                    <Award className="h-5 w-5 text-purple-600" />
                                    Mis Habilidades
                                    {habilidades.length > 0 && (
                                        <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                            {habilidades.length}
                                        </span>
                                    )}
                                </h3>

                                {habilidades.length === 0 ? (
                                    <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                                        <CardContent className="py-12 text-center">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Award className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-600 font-medium mb-1">No has agregado habilidades aún</p>
                                            <p className="text-gray-500 text-sm">
                                                Usa el formulario de arriba para comenzar a destacar tus capacidades
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {habilidades.map((habilidad, index) => (
                                            <Card
                                                key={habilidad.id || habilidad.tempId || index}
                                                className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white"
                                            >
                                                <CardContent className="pt-5 pb-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900 text-lg mb-2">
                                                                {habilidad.nombre}
                                                            </h4>
                                                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">
                                                                {habilidad.categoria}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 hover:bg-blue-50 rounded-lg transition-colors"
                                                                onClick={() => handleEditHabilidad(index)}
                                                            >
                                                                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 hover:bg-red-50 rounded-lg transition-colors"
                                                                onClick={() => handleDeleteHabilidad(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 mt-4">
                                                        <Badge className={`${getNivelColor(habilidad.nivel)} border-0 shadow-sm px-3 py-1`}>
                                                            <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                                                            {habilidad.nivel}
                                                        </Badge>

                                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {habilidad.anios_experiencia} {habilidad.anios_experiencia === 1 ? 'año' : 'años'} de experiencia
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="border-t pt-4 mt-4 bg-gray-50/50 -mx-6 -mb-6 px-6 pb-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-gray-100"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmitCV)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2 shadow-md hover:shadow-lg transition-all"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Briefcase className="h-4 w-4" />
                                {editingCV ? 'Actualizar' : 'Crear'} Currículum
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};