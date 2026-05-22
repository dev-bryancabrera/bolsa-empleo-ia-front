import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/core/components/ui/dialog';
import { toast } from 'react-toastify';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Badge } from '@/core/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/core/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import {
    Plus, Edit2, Trash2, Briefcase, GraduationCap, Award, Target, TrendingUp,
    FileCheck, Link2, Upload, Phone, MapPin, Globe, Linkedin, Github,
    Calendar, Languages, BadgeCheck, Clock, Building2, Printer,
    CheckCircle2, Circle, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { CVService } from '@/modules/cv/services/CVService';
import { CVDialog } from '../components/CVDialog';
import { HabilidadService } from '../services/HabilidadService';
import { CVValidarTab } from '../components/CVValidarTab';
import { CVCompatibilidadTab } from '../components/CVCompatibilidadTab';
import { CVSubirTab } from '../components/CVSubirTab';
import { printCV } from '../components/CVPrintTemplate';
import { CVOptimizarModal } from '../components/CVOptimizarModal';
import type { OptimizacionResultado } from '../components/CVOptimizarModal';
import {
    ExperienciaService,
    EducacionService,
    IdiomaService,
    CertificacionService,
} from '../services/CVSectionService';
import type { ExperienciaLaboral, Educacion, Idioma, Certificacion } from '../types/CVType';

// ── Isolated dialog components (own local state → no CVPage re-render on keypress) ──

interface ExperienciaDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    cvId: number;
    initial?: ExperienciaLaboral | null;
    onSaved: () => void;
}
const ExperienciaDialog = ({ open, onOpenChange, cvId, initial, onSaved }: ExperienciaDialogProps) => {
    const blank = { id_cv: cvId, empresa: '', cargo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', es_trabajo_actual: false };
    const [form, setForm] = useState<Omit<ExperienciaLaboral, 'id'>>(blank);

    useEffect(() => {
        setForm(initial ? { ...initial, id_cv: initial.id_cv ?? cvId } : { ...blank, id_cv: cvId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSave = async () => {
        if (!form.empresa || !form.cargo || !form.fecha_inicio) { toast.error('Empresa, cargo y fecha de inicio son requeridos'); return; }
        try {
            if (initial?.id) {
                await ExperienciaService.actualizar(initial.id, { ...form, id_cv: cvId });
                toast.success('Experiencia actualizada');
            } else {
                await ExperienciaService.crear({ ...form, id_cv: cvId });
                toast.success('Experiencia agregada');
            }
            onSaved();
            onOpenChange(false);
        } catch { toast.error('Error al guardar la experiencia'); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        {initial ? 'Editar Experiencia' : 'Nueva Experiencia Laboral'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Empresa <span className="text-red-500">*</span></Label>
                            <Input placeholder="ej. Google" value={form.empresa} onChange={(e) => setForm(f => ({ ...f, empresa: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Cargo <span className="text-red-500">*</span></Label>
                            <Input placeholder="ej. Desarrollador Senior" value={form.cargo} onChange={(e) => setForm(f => ({ ...f, cargo: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha inicio <span className="text-red-500">*</span></Label>
                            <Input type="month" value={form.fecha_inicio} onChange={(e) => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha fin</Label>
                            <Input type="month" value={form.fecha_fin ?? ''} disabled={form.es_trabajo_actual} onChange={(e) => setForm(f => ({ ...f, fecha_fin: e.target.value }))} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.es_trabajo_actual}
                            onChange={(e) => setForm(f => ({ ...f, es_trabajo_actual: e.target.checked, fecha_fin: e.target.checked ? '' : f.fecha_fin }))} />
                        Trabajo actual
                    </label>
                    <div className="space-y-1.5">
                        <Label>Descripción</Label>
                        <textarea rows={3} placeholder="Describe tus responsabilidades y logros..."
                            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.descripcion} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                        {initial ? <><Edit2 className="h-4 w-4" />Actualizar</> : <><Plus className="h-4 w-4" />Guardar</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface EducacionDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    cvId: number;
    initial?: Educacion | null;
    onSaved: () => void;
}
const EducacionDialog = ({ open, onOpenChange, cvId, initial, onSaved }: EducacionDialogProps) => {
    const blank = { id_cv: cvId, institucion: '', titulo: '', nivel: '', fecha_inicio: '', fecha_fin: '', en_curso: false, descripcion: '' };
    const [form, setForm] = useState<Omit<Educacion, 'id'>>(blank);

    useEffect(() => {
        setForm(initial ? { ...initial, id_cv: initial.id_cv ?? cvId } : { ...blank, id_cv: cvId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSave = async () => {
        if (!form.institucion || !form.titulo || !form.nivel || !form.fecha_inicio) { toast.error('Institución, título, nivel y fecha de inicio son requeridos'); return; }
        try {
            if (initial?.id) {
                await EducacionService.actualizar(initial.id, { ...form, id_cv: cvId });
                toast.success('Educación actualizada');
            } else {
                await EducacionService.crear({ ...form, id_cv: cvId });
                toast.success('Educación agregada');
            }
            onSaved();
            onOpenChange(false);
        } catch { toast.error('Error al guardar la educación'); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                        {initial ? 'Editar Educación' : 'Nueva Educación'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Institución <span className="text-red-500">*</span></Label>
                            <Input placeholder="ej. Universidad Nacional" value={form.institucion} onChange={(e) => setForm(f => ({ ...f, institucion: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Título <span className="text-red-500">*</span></Label>
                            <Input placeholder="ej. Ingeniería en Sistemas" value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Nivel <span className="text-red-500">*</span></Label>
                            <Select value={form.nivel || 'none'} onValueChange={(v) => { if (v !== 'none') setForm(f => ({ ...f, nivel: v })); }}>
                                <SelectTrigger><SelectValue placeholder="Selecciona el nivel" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" disabled>Selecciona nivel</SelectItem>
                                    {['Bachillerato','Técnico','Tecnólogo','Licenciatura','Ingeniería','Maestría','Doctorado','Otro'].map(n => (
                                        <SelectItem key={n} value={n}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha inicio <span className="text-red-500">*</span></Label>
                            <Input type="month" value={form.fecha_inicio} onChange={(e) => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha fin</Label>
                            <Input type="month" value={form.fecha_fin ?? ''} disabled={form.en_curso} onChange={(e) => setForm(f => ({ ...f, fecha_fin: e.target.value }))} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 accent-primary" checked={form.en_curso}
                            onChange={(e) => setForm(f => ({ ...f, en_curso: e.target.checked, fecha_fin: e.target.checked ? '' : f.fecha_fin }))} />
                        En curso
                    </label>
                    <div className="space-y-1.5">
                        <Label>Descripción</Label>
                        <textarea rows={2} placeholder="Descripción opcional..."
                            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.descripcion ?? ''} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                        {initial ? <><Edit2 className="h-4 w-4" />Actualizar</> : <><Plus className="h-4 w-4" />Guardar</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface CertificacionDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    cvId: number;
    initial?: Certificacion | null;
    onSaved: () => void;
}
const CertificacionDialog = ({ open, onOpenChange, cvId, initial, onSaved }: CertificacionDialogProps) => {
    const blank = { id_cv: cvId, nombre: '', emisor: '', fecha: '', url_credencial: '' };
    const [form, setForm] = useState<Omit<Certificacion, 'id'>>(blank);

    useEffect(() => {
        setForm(initial ? { ...initial, id_cv: initial.id_cv ?? cvId } : { ...blank, id_cv: cvId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSave = async () => {
        if (!form.nombre) { toast.error('El nombre de la certificación es requerido'); return; }
        try {
            if (initial?.id) {
                await CertificacionService.actualizar(initial.id, { ...form, id_cv: cvId });
                toast.success('Certificación actualizada');
            } else {
                await CertificacionService.crear({ ...form, id_cv: cvId });
                toast.success('Certificación agregada');
            }
            onSaved();
            onOpenChange(false);
        } catch { toast.error('Error al guardar la certificación'); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-yellow-600" />
                        {initial ? 'Editar Certificación' : 'Nueva Certificación'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label>Nombre <span className="text-red-500">*</span></Label>
                        <Input placeholder="ej. AWS Certified Solutions Architect" value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Emisor</Label>
                            <Input placeholder="ej. Amazon, Google, Coursera" value={form.emisor ?? ''} onChange={(e) => setForm(f => ({ ...f, emisor: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha de obtención</Label>
                            <Input type="month" value={form.fecha ?? ''} onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>URL de credencial</Label>
                        <Input placeholder="https://..." value={form.url_credencial ?? ''} onChange={(e) => setForm(f => ({ ...f, url_credencial: e.target.value }))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2">
                        {initial ? <><Edit2 className="h-4 w-4" />Actualizar</> : <><Plus className="h-4 w-4" />Guardar</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface IdiomaDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    cvId: number;
    initial?: Idioma | null;
    onSaved: () => void;
}
const IdiomaDialog = ({ open, onOpenChange, cvId, initial, onSaved }: IdiomaDialogProps) => {
    const blank = { id_cv: cvId, nombre: '', nivel: '' };
    const [form, setForm] = useState<Omit<Idioma, 'id'>>(blank);

    useEffect(() => {
        setForm(initial ? { ...initial, id_cv: initial.id_cv ?? cvId } : { ...blank, id_cv: cvId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSave = async () => {
        if (!form.nombre || !form.nivel) { toast.error('Nombre y nivel son requeridos'); return; }
        try {
            if (initial?.id) {
                await IdiomaService.actualizar(initial.id, { ...form, id_cv: cvId });
                toast.success('Idioma actualizado');
            } else {
                await IdiomaService.crear({ ...form, id_cv: cvId });
                toast.success('Idioma agregado');
            }
            onSaved();
            onOpenChange(false);
        } catch { toast.error('Error al guardar el idioma'); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5 text-blue-600" />
                        {initial ? 'Editar Idioma' : 'Agregar Idioma'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label>Idioma <span className="text-red-500">*</span></Label>
                        <Input placeholder="ej. Inglés, Francés" value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Nivel <span className="text-red-500">*</span></Label>
                        <Select value={form.nivel || 'none'} onValueChange={(v) => { if (v !== 'none') setForm(f => ({ ...f, nivel: v })); }}>
                            <SelectTrigger><SelectValue placeholder="Selecciona el nivel" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" disabled>Selecciona nivel</SelectItem>
                                {['Básico','Intermedio','Avanzado','Nativo'].map(n => (
                                    <SelectItem key={n} value={n}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        {initial ? <><Edit2 className="h-4 w-4" />Actualizar</> : <><Plus className="h-4 w-4" />Guardar</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const CVPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const [cvData, setCvData] = useState<any>(null);
    const [habilidades, setHabilidades] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingHabilidad, setIsEditingHabilidad] = useState(false);
    const [currentHabilidad, setCurrentHabilidad] = useState<any>(null);

    // Sub-section state
    const [experiencias, setExperiencias] = useState<ExperienciaLaboral[]>([]);
    const [educaciones, setEducaciones] = useState<Educacion[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);

    // Optimización IA
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isApplyingOptimization, setIsApplyingOptimization] = useState(false);
    const [optimizarModalOpen, setOptimizarModalOpen] = useState(false);
    const [optimizacionResultado, setOptimizacionResultado] = useState<OptimizacionResultado | null>(null);

    // Section dialogs — Experiencia
    const [isAddingExperiencia, setIsAddingExperiencia] = useState(false);
    const [currentExperiencia, setCurrentExperiencia] = useState<ExperienciaLaboral | null>(null);

    // Section dialogs — Educación
    const [isAddingEducacion, setIsAddingEducacion] = useState(false);
    const [currentEducacion, setCurrentEducacion] = useState<Educacion | null>(null);

    // Section dialogs — Idioma
    const [isAddingIdioma, setIsAddingIdioma] = useState(false);
    const [currentIdioma, setCurrentIdioma] = useState<Idioma | null>(null);

    // Section dialogs — Certificación
    const [isAddingCertificacion, setIsAddingCertificacion] = useState(false);
    const [currentCertificacion, setCurrentCertificacion] = useState<Certificacion | null>(null);

    // Estados del formulario Habilidad
    const [formHabilidad, setFormHabilidad] = useState({
        nombre: '',
        categoria: '',
        nivel: '',
        anios_experiencia: 0,
    });

    useEffect(() => {
        fetchCVData();
    }, []);

    const fetchCVData = async () => {
        if (authUser?.id) {
            try {
                const data = await CVService.obtenerCVPorUsuario(authUser.id);

                if (!data) {
                    console.warn('El usuario no tiene CV aún');
                    setCvData(null);
                    setHabilidades([]);
                    setExperiencias([]);
                    setEducaciones([]);
                    setIdiomas([]);
                    setCertificaciones([]);
                    return;
                }

                if (data?.habilidades) {
                    setHabilidades(data.habilidades);
                }

                setCvData(data);

                // Load sub-sections
                if (data?.id) {
                    const [exps, edus, idms, certs] = await Promise.all([
                        ExperienciaService.listarPorCV(data.id).catch(() => []),
                        EducacionService.listarPorCV(data.id).catch(() => []),
                        IdiomaService.listarPorCV(data.id).catch(() => []),
                        CertificacionService.listarPorCV(data.id).catch(() => []),
                    ]);
                    setExperiencias(exps || []);
                    setEducaciones(edus || []);
                    setIdiomas(idms || []);
                    setCertificaciones(certs || []);
                }
            } catch (error) {
                console.error('Error cargando datos de persona: ', error);
            }
        }
    };

    const handleSaveCV = async () => {
        await fetchCVData();
        setIsModalOpen(false);
    };

    const handleOptimizarCV = async () => {
        if (!cvData?.id) return;
        setOptimizacionResultado(null);
        setIsOptimizing(true);
        setOptimizarModalOpen(true);
        try {
            const resultado = await CVService.optimizarCV(cvData.id);
            setOptimizacionResultado(resultado);
        } catch {
            toast.error('Error al optimizar el CV. Intenta nuevamente.');
            setOptimizarModalOpen(false);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleAplicarOptimizacion = async () => {
        if (!cvData?.id || !optimizacionResultado?.campos_mejorados) return;
        setIsApplyingOptimization(true);
        try {
            await CVService.actualizarCV(cvData.id, optimizacionResultado.campos_mejorados);
            await fetchCVData();
            setOptimizarModalOpen(false);
            setOptimizacionResultado(null);
            toast.success('¡CV optimizado exitosamente!');
        } catch {
            toast.error('Error al aplicar las mejoras. Intenta nuevamente.');
        } finally {
            setIsApplyingOptimization(false);
        }
    };

    const handleSaveHabilidad = async () => {
        try {
            if (!cvData?.id) {
                toast.error('Debes crear un CV primero');
                return;
            }

            if (!formHabilidad.nombre || !formHabilidad.categoria || !formHabilidad.nivel) {
                toast.error('Por favor completa todos los campos');
                return;
            }

            if (currentHabilidad?.id) {
                await HabilidadService.actualizarHabilidad(currentHabilidad.id, {
                    nombre: formHabilidad.nombre,
                    categoria: formHabilidad.categoria,
                    nivel: formHabilidad.nivel,
                    anios_experiencia: formHabilidad.anios_experiencia,
                    id_cv: cvData.id,
                });
                toast.success('Habilidad actualizada exitosamente');
            } else {
                await HabilidadService.crearHabilidad({
                    nombre: formHabilidad.nombre,
                    categoria: formHabilidad.categoria,
                    nivel: formHabilidad.nivel,
                    anios_experiencia: formHabilidad.anios_experiencia,
                    id_cv: cvData.id,
                });
                toast.success('Habilidad creada exitosamente');
            }

            await fetchCVData();
            setIsEditingHabilidad(false);
            setCurrentHabilidad(null);
            setFormHabilidad({ nombre: '', categoria: '', nivel: '', anios_experiencia: 0 });
        } catch (error) {
            console.error('Error al guardar habilidad:', error);
            toast.error('Error al guardar la habilidad');
        }
    };

    const handleDeleteHabilidad = async (idHabilidad: number) => {
        try {
            await HabilidadService.eliminarHabilidad(idHabilidad);
            toast.success('Habilidad eliminada exitosamente');
            await fetchCVData();
        } catch (error) {
            console.error('Error al eliminar habilidad:', error);
            toast.error('Error al eliminar la habilidad');
        }
    };

    const handleDeleteExperiencia = async (id: number) => {
        try {
            await ExperienciaService.eliminar(id);
            toast.success('Experiencia eliminada');
            await fetchCVData();
        } catch { toast.error('Error al eliminar la experiencia'); }
    };

    const handleDeleteEducacion = async (id: number) => {
        try {
            await EducacionService.eliminar(id);
            toast.success('Educación eliminada');
            await fetchCVData();
        } catch { toast.error('Error al eliminar la educación'); }
    };

    const handleDeleteIdioma = async (id: number) => {
        try {
            await IdiomaService.eliminar(id);
            toast.success('Idioma eliminado');
            await fetchCVData();
        } catch { toast.error('Error al eliminar el idioma'); }
    };

    const handleDeleteCertificacion = async (id: number) => {
        try {
            await CertificacionService.eliminar(id);
            toast.success('Certificación eliminada');
            await fetchCVData();
        } catch { toast.error('Error al eliminar la certificación'); }
    };

    const getNivelColor = (nivel: string) => {
        const colores: Record<string, string> = {
            'Básico': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'Intermedio': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            'Avanzado': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
            'Experto': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        };
        return colores[nivel] || 'bg-muted text-muted-foreground';
    };

    const getIdiomaColor = (nivel: string) => {
        const colores: Record<string, string> = {
            'Nativo': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
            'Avanzado': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
            'Intermedio': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
            'Básico': 'bg-muted text-muted-foreground border-border',
        };
        return colores[nivel] || 'bg-muted text-muted-foreground border-border';
    };

    // ── CV Completeness ──────────────────────────────────────────────────────
    const completitudSecciones = cvData ? [
        {
            id: 'perfil',
            label: 'Perfil básico',
            desc: 'Título, resumen profesional',
            peso: 20,
            completo: !!(cvData.titulo_profesional && cvData.resumen_profesional),
            accion: () => setIsModalOpen(true),
        },
        {
            id: 'contacto',
            label: 'Contacto',
            desc: 'Teléfono o ubicación',
            peso: 10,
            completo: !!(cvData.telefono || cvData.ciudad),
            accion: () => setIsModalOpen(true),
        },
        {
            id: 'experiencia',
            label: 'Experiencia laboral',
            desc: 'Al menos 1 entrada',
            peso: 25,
            completo: experiencias.length > 0,
            accion: () => {
                document.getElementById('cv-section-experiencia')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => { setCurrentExperiencia(null); setIsAddingExperiencia(true); }, 400);
            },
        },
        {
            id: 'educacion',
            label: 'Educación',
            desc: 'Al menos 1 entrada',
            peso: 20,
            completo: educaciones.length > 0,
            accion: () => {
                document.getElementById('cv-section-educacion')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => { setCurrentEducacion(null); setIsAddingEducacion(true); }, 400);
            },
        },
        {
            id: 'habilidades',
            label: 'Habilidades',
            desc: 'Al menos 3 habilidades',
            peso: 15,
            completo: habilidades.length >= 3,
            accion: () => {
                document.getElementById('cv-section-habilidades')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => { setCurrentHabilidad(null); setFormHabilidad({ nombre: '', categoria: '', nivel: '', anios_experiencia: 0 }); setIsEditingHabilidad(true); }, 400);
            },
        },
        {
            id: 'idiomas',
            label: 'Idiomas',
            desc: 'Al menos 1 idioma',
            peso: 10,
            completo: idiomas.length > 0,
            accion: () => {
                document.getElementById('cv-section-idiomas')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => { setCurrentIdioma(null); setIsAddingIdioma(true); }, 400);
            },
        },
    ] : [];

    const porcentajeCompleto = completitudSecciones.reduce((acc, s) => acc + (s.completo ? s.peso : 0), 0);
    const proximaSeccion = completitudSecciones.find(s => !s.completo);

    const colorBarra = porcentajeCompleto >= 80
        ? 'bg-green-500'
        : porcentajeCompleto >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500';

    const colorTexto = porcentajeCompleto >= 80
        ? 'text-green-600'
        : porcentajeCompleto >= 50
        ? 'text-yellow-600'
        : 'text-red-600';

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-1">Currículum Vitae</h1>
                <p className="text-muted-foreground">Gestiona, valida y optimiza tu perfil profesional con IA</p>
            </div>

            <Tabs defaultValue="mi-cv" className="space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto gap-1 bg-muted p-1 rounded-xl">
                    <TabsTrigger value="mi-cv" className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Briefcase className="h-4 w-4" />
                        <span className="hidden sm:inline">Mi CV</span>
                        <span className="sm:hidden text-xs">Mi CV</span>
                    </TabsTrigger>
                    <TabsTrigger value="validar" className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <FileCheck className="h-4 w-4" />
                        <span className="hidden sm:inline">Validar CV</span>
                        <span className="sm:hidden text-xs">Validar</span>
                    </TabsTrigger>
                    <TabsTrigger value="compatibilidad" className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Link2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Compatibilidad</span>
                        <span className="sm:hidden text-xs">Compat.</span>
                    </TabsTrigger>
                    <TabsTrigger value="subir" className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Subir CV</span>
                        <span className="sm:hidden text-xs">Subir</span>
                    </TabsTrigger>
                </TabsList>

                {/* ── TAB: MI CV ── */}
                <TabsContent value="mi-cv" className="space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <div />
                        {cvData ? (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => printCV({
                                        cvData,
                                        userName: authUser?.google_nombre ?? authUser?.email ?? '',
                                        userEmail: authUser?.email ?? '',
                                        habilidades,
                                        experiencias,
                                        educaciones,
                                        idiomas,
                                        certificaciones,
                                    })}
                                    className="gap-2 hover:bg-primary hover:text-white transition-all"
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimir CV
                                </Button>
                                <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-yellow-500 hover:bg-yellow-600">
                                    ✏️ Editar CV
                                </Button>
                                <Button
                                    onClick={handleOptimizarCV}
                                    disabled={isOptimizing}
                                    className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-md"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Optimizar CV con IA
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {cvData ? (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-card dark:from-blue-950/30">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Años de Experiencia</CardTitle>
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{cvData.anios_experiencia || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-2">Experiencia profesional</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-card dark:from-purple-950/30">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Nivel de Educación</CardTitle>
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                            <GraduationCap className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-foreground truncate">{cvData.nivel_educacion || 'No especificado'}</div>
                                        <p className="text-xs text-muted-foreground mt-2">Formación académica</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-card dark:from-orange-950/30">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Sector Profesional</CardTitle>
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                            <Target className="h-5 w-5 text-orange-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-lg font-bold text-foreground truncate">{cvData.sector_profesional || 'No especificado'}</div>
                                        <p className="text-xs text-muted-foreground mt-2">Área de especialización</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-card dark:from-green-950/30">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Habilidades</CardTitle>
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <Award className="h-5 w-5 text-green-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{habilidades.length}</div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            <span className="text-green-600 font-medium">Registradas</span>
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ── Completitud del CV ── */}
                            <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-slate-50 to-card dark:from-slate-950/30">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Circle indicator */}
                                        <div className="relative w-20 h-20 shrink-0 mx-auto sm:mx-0">
                                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                                <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                <circle
                                                    cx="40" cy="40" r="32" fill="none"
                                                    stroke={porcentajeCompleto >= 80 ? '#22c55e' : porcentajeCompleto >= 50 ? '#eab308' : '#ef4444'}
                                                    strokeWidth="8"
                                                    strokeDasharray={`${(porcentajeCompleto / 100) * 201} 201`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-lg font-bold leading-none ${colorTexto}`}>{porcentajeCompleto}%</span>
                                            </div>
                                        </div>

                                        {/* Sections list */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">Completitud del CV</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {porcentajeCompleto === 100
                                                            ? '¡Tu CV está completo!'
                                                            : `Faltan ${completitudSecciones.filter(s => !s.completo).length} sección${completitudSecciones.filter(s => !s.completo).length !== 1 ? 'es' : ''} por completar`
                                                        }
                                                    </p>
                                                </div>
                                                {proximaSeccion && (
                                                    <button
                                                        onClick={proximaSeccion.accion}
                                                        className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors"
                                                    >
                                                        Completar: {proximaSeccion.label}
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5 mb-3">
                                                <div className={`h-1.5 rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${porcentajeCompleto}%` }} />
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                {completitudSecciones.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={s.accion}
                                                        className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                                                    >
                                                        {s.completo
                                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                            : <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                                        }
                                                        <span className={s.completo ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                                                            {s.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Perfil Profesional */}
                            <Card className="border-0 shadow-lg mb-6 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                                        <Briefcase className="h-6 w-6 text-blue-600" />
                                        {cvData.titulo_profesional}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                        {cvData.resumen_profesional || 'No hay resumen profesional disponible.'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Info de Contacto */}
                            {(cvData.telefono || cvData.ciudad || cvData.pais || cvData.linkedin_url || cvData.github_url || cvData.portfolio_url || cvData.disponibilidad || cvData.modalidad_trabajo) && (
                                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-cyan-50 to-card dark:from-cyan-950/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <Phone className="h-5 w-5 text-cyan-600" />
                                            Información de Contacto
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {cvData.telefono && (
                                                <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-cyan-100 dark:border-cyan-900 shadow-sm">
                                                    <Phone className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                                    <span className="text-sm text-foreground">{cvData.telefono}</span>
                                                </div>
                                            )}
                                            {(cvData.ciudad || cvData.pais) && (
                                                <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-cyan-100 dark:border-cyan-900 shadow-sm">
                                                    <MapPin className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                                    <span className="text-sm text-foreground">{[cvData.ciudad, cvData.pais].filter(Boolean).join(', ')}</span>
                                                </div>
                                            )}
                                            {cvData.disponibilidad && (
                                                <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-cyan-100 dark:border-cyan-900 shadow-sm">
                                                    <Clock className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                                    <span className="text-sm text-foreground">Disponibilidad: {cvData.disponibilidad}</span>
                                                </div>
                                            )}
                                            {cvData.modalidad_trabajo && (
                                                <div className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-cyan-100 dark:border-cyan-900 shadow-sm">
                                                    <Building2 className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                                    <span className="text-sm text-foreground">Modalidad: {cvData.modalidad_trabajo}</span>
                                                </div>
                                            )}
                                            {cvData.linkedin_url && (
                                                <a href={cvData.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-900 shadow-sm hover:border-blue-300 transition-colors">
                                                    <Linkedin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm text-blue-600 hover:underline truncate">LinkedIn</span>
                                                </a>
                                            )}
                                            {cvData.github_url && (
                                                <a href={cvData.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border shadow-sm hover:border-muted-foreground/40 transition-colors">
                                                    <Github className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm text-foreground hover:underline truncate">GitHub</span>
                                                </a>
                                            )}
                                            {cvData.portfolio_url && (
                                                <a href={cvData.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-purple-100 dark:border-purple-900 shadow-sm hover:border-purple-300 transition-colors">
                                                    <Globe className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                                    <span className="text-sm text-purple-600 hover:underline truncate">Portfolio</span>
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Experiencia Laboral */}
                            <Card id="cv-section-experiencia" className="border-0 shadow-lg mb-6 bg-gradient-to-br from-green-50 to-card dark:from-green-950/30">
                                <CardHeader>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-green-600" />
                                            Experiencia Laboral
                                            {experiencias.length > 0 && <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">{experiencias.length}</span>}
                                        </CardTitle>
                                        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                            onClick={() => { setCurrentExperiencia(null); setIsAddingExperiencia(true); }}>
                                            <Plus className="h-4 w-4" /> Agregar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {experiencias.length > 0 ? (
                                        <div className="space-y-4">
                                            {experiencias.map((exp) => (
                                                <div key={exp.id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-green-200">
                                                    <div className="absolute -left-2 top-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card shadow-sm"></div>
                                                    <div className="bg-card rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between flex-wrap gap-2">
                                                            <div>
                                                                <h4 className="font-bold text-foreground">{exp.cargo}</h4>
                                                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                                                    <Building2 className="h-3.5 w-3.5" />{exp.empresa}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {exp.es_trabajo_actual && <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">Actual</Badge>}
                                                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {exp.fecha_inicio} — {exp.es_trabajo_actual ? 'Presente' : (exp.fecha_fin || '')}
                                                                </span>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                                    onClick={() => { setCurrentExperiencia(exp); setIsAddingExperiencia(true); }}>
                                                                    <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                    onClick={() => handleDeleteExperiencia(exp.id!)}>
                                                                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {exp.descripcion && <p className="text-sm text-muted-foreground mt-2">{exp.descripcion}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-2 border-dashed border-border bg-muted/20">
                                            <CardContent className="py-10 text-center">
                                                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Briefcase className="h-7 w-7 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-foreground font-medium mb-1">Sin experiencia laboral</p>
                                                <p className="text-muted-foreground text-sm mb-4">Agrega tu primera experiencia para fortalecer tu perfil</p>
                                                <Button onClick={() => { setCurrentExperiencia(null); setIsAddingExperiencia(true); }} className="bg-green-600 hover:bg-green-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Agregar Experiencia
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Educación */}
                            <Card id="cv-section-educacion" className="border-0 shadow-lg mb-6 bg-gradient-to-br from-purple-50 to-card dark:from-purple-950/30">
                                <CardHeader>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-purple-600" />
                                            Educación
                                            {educaciones.length > 0 && <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">{educaciones.length}</span>}
                                        </CardTitle>
                                        <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                            onClick={() => { setCurrentEducacion(null); setIsAddingEducacion(true); }}>
                                            <Plus className="h-4 w-4" /> Agregar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {educaciones.length > 0 ? (
                                        <div className="space-y-4">
                                            {educaciones.map((edu) => (
                                                <div key={edu.id} className="relative pl-6 pb-4 last:pb-0 border-l-2 border-purple-200">
                                                    <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-card shadow-sm"></div>
                                                    <div className="bg-card rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between flex-wrap gap-2">
                                                            <div>
                                                                <h4 className="font-bold text-foreground">{edu.titulo}</h4>
                                                                <p className="text-sm text-muted-foreground font-medium mt-0.5">{edu.institucion}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Badge variant="secondary" className="text-xs">{edu.nivel}</Badge>
                                                                {edu.en_curso && <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs">En curso</Badge>}
                                                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {edu.fecha_inicio} — {edu.en_curso ? 'Presente' : (edu.fecha_fin || '')}
                                                                </span>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                                    onClick={() => { setCurrentEducacion(edu); setIsAddingEducacion(true); }}>
                                                                    <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                    onClick={() => handleDeleteEducacion(edu.id!)}>
                                                                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {edu.descripcion && <p className="text-sm text-muted-foreground mt-2">{edu.descripcion}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-2 border-dashed border-border bg-muted/20">
                                            <CardContent className="py-10 text-center">
                                                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <GraduationCap className="h-7 w-7 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-foreground font-medium mb-1">Sin educación registrada</p>
                                                <p className="text-muted-foreground text-sm mb-4">Agrega tu formación académica para completar tu perfil</p>
                                                <Button onClick={() => { setCurrentEducacion(null); setIsAddingEducacion(true); }} className="bg-purple-600 hover:bg-purple-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Agregar Educación
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Idiomas */}
                            <Card id="cv-section-idiomas" className="border-0 shadow-lg mb-6 bg-gradient-to-br from-blue-50 to-card dark:from-blue-950/30">
                                <CardHeader>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <Languages className="h-5 w-5 text-blue-600" />
                                            Idiomas
                                            {idiomas.length > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">{idiomas.length}</span>}
                                        </CardTitle>
                                        <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                            onClick={() => { setCurrentIdioma(null); setIsAddingIdioma(true); }}>
                                            <Plus className="h-4 w-4" /> Agregar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {idiomas.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {idiomas.map((idioma) => (
                                                <div key={idioma.id} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getIdiomaColor(idioma.nivel)} shadow-sm`}>
                                                    <Languages className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">{idioma.nombre}</span>
                                                    <span className="text-xs font-medium opacity-80">— {idioma.nivel}</span>
                                                    <button className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                                                        onClick={() => { setCurrentIdioma(idioma); setIsAddingIdioma(true); }}>
                                                        <Edit2 className="h-3 w-3" />
                                                    </button>
                                                    <button className="opacity-60 hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDeleteIdioma(idioma.id!)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-2 border-dashed border-border bg-muted/20">
                                            <CardContent className="py-10 text-center">
                                                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Languages className="h-7 w-7 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-foreground font-medium mb-1">Sin idiomas registrados</p>
                                                <p className="text-muted-foreground text-sm mb-4">Agrega los idiomas que manejas</p>
                                                <Button onClick={() => { setCurrentIdioma(null); setIsAddingIdioma(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Agregar Idioma
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Certificaciones */}
                            <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-yellow-50 to-card dark:from-yellow-950/30">
                                <CardHeader>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <BadgeCheck className="h-5 w-5 text-yellow-600" />
                                            Certificaciones
                                            {certificaciones.length > 0 && <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">{certificaciones.length}</span>}
                                        </CardTitle>
                                        <Button size="sm" className="gap-1 bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm"
                                            onClick={() => { setCurrentCertificacion(null); setIsAddingCertificacion(true); }}>
                                            <Plus className="h-4 w-4" /> Agregar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {certificaciones.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {certificaciones.map((cert) => (
                                                <div key={cert.id} className="bg-card rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <BadgeCheck className="h-5 w-5 text-yellow-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-foreground text-sm">{cert.nombre}</h4>
                                                        {cert.emisor && <p className="text-xs text-muted-foreground mt-0.5">{cert.emisor}</p>}
                                                        {cert.fecha && (
                                                            <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />{cert.fecha}
                                                            </p>
                                                        )}
                                                        {cert.url_credencial && (
                                                            <a href={cert.url_credencial} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                                                                <Link2 className="h-3 w-3" />Ver credencial
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1 shrink-0">
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                            onClick={() => { setCurrentCertificacion(cert); setIsAddingCertificacion(true); }}>
                                                            <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                            onClick={() => handleDeleteCertificacion(cert.id!)}>
                                                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-2 border-dashed border-border bg-muted/20">
                                            <CardContent className="py-10 text-center">
                                                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <BadgeCheck className="h-7 w-7 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-foreground font-medium mb-1">Sin certificaciones</p>
                                                <p className="text-muted-foreground text-sm mb-4">Agrega tus certificados y cursos completados</p>
                                                <Button onClick={() => { setCurrentCertificacion(null); setIsAddingCertificacion(true); }} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Agregar Certificación
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Habilidades */}
                            <Card id="cv-section-habilidades" className="border-0 shadow-lg bg-card">
                                <CardHeader>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-purple-600 shrink-0" />
                                            <span className="text-xl font-bold text-foreground">Habilidades Profesionales</span>
                                            {habilidades.length > 0 && (
                                                <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">{habilidades.length}</span>
                                            )}
                                        </div>
                                        <Dialog open={isEditingHabilidad} onOpenChange={setIsEditingHabilidad}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="shrink-0 gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all"
                                                    onClick={() => { setCurrentHabilidad(null); setFormHabilidad({ nombre: '', categoria: '', nivel: '', anios_experiencia: 0 }); }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Agregar Habilidad
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader className="border-b pb-4 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950/30 dark:to-purple-950/30 -mx-6 -mt-6 px-6 pt-6 mb-4">
                                                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            {currentHabilidad ? <Edit2 className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl">{currentHabilidad ? 'Editar Habilidad' : 'Nueva Habilidad'}</div>
                                                            <p className="text-sm font-normal text-muted-foreground mt-1">
                                                                {currentHabilidad ? 'Modifica la información de tu habilidad' : 'Agrega una nueva habilidad a tu perfil profesional'}
                                                            </p>
                                                        </div>
                                                    </DialogTitle>
                                                </DialogHeader>

                                                <div className="space-y-4 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></Label>
                                                            <Input placeholder="ej. React.js, Python" value={formHabilidad.nombre}
                                                                onChange={(e) => setFormHabilidad({ ...formHabilidad, nombre: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Categoría <span className="text-red-500">*</span></Label>
                                                            <Input placeholder="ej. Frontend, Backend" value={formHabilidad.categoria}
                                                                onChange={(e) => setFormHabilidad({ ...formHabilidad, categoria: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Nivel <span className="text-red-500">*</span></Label>
                                                            <Select value={formHabilidad.nivel || 'none'}
                                                                onValueChange={(v) => { if (v !== 'none') setFormHabilidad({ ...formHabilidad, nivel: v }); }}>
                                                                <SelectTrigger><SelectValue placeholder="Selecciona el nivel" /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none" disabled>Selecciona un nivel</SelectItem>
                                                                    <SelectItem value="Básico">Básico</SelectItem>
                                                                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                                                                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                                                                    <SelectItem value="Experto">Experto</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Años de Experiencia</Label>
                                                            <Input type="number" min="0" max="50" placeholder="0"
                                                                value={formHabilidad.anios_experiencia}
                                                                onChange={(e) => setFormHabilidad({ ...formHabilidad, anios_experiencia: parseInt(e.target.value) || 0 })} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <DialogFooter className="border-t pt-4 mt-4 bg-muted/30 -mx-6 -mb-6 px-6 pb-6">
                                                    <Button variant="outline" onClick={() => { setIsEditingHabilidad(false); setCurrentHabilidad(null); setFormHabilidad({ nombre: '', categoria: '', nivel: '', anios_experiencia: 0 }); }}>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={handleSaveHabilidad} className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 gap-2 shadow-md">
                                                        {currentHabilidad ? <><Edit2 className="h-4 w-4" />Actualizar</> : <><Plus className="h-4 w-4" />Guardar</>}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {habilidades.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {habilidades.map((habilidad) => (
                                                <Card key={habilidad.id} className="border-2 border-border hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-card">
                                                    <CardContent className="pt-5 pb-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-foreground text-lg mb-2">{habilidad.nombre}</h4>
                                                                <Badge variant="secondary" className="text-xs font-medium">{habilidad.categoria}</Badge>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                                                    onClick={() => { setCurrentHabilidad(habilidad); setFormHabilidad(habilidad); setIsEditingHabilidad(true); }}>
                                                                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                                    onClick={() => handleDeleteHabilidad(habilidad.id)}>
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3 mt-4">
                                                            <Badge className={`${getNivelColor(habilidad.nivel)} border-0 shadow-sm px-3 py-1`}>
                                                                <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                                                                {habilidad.nivel}
                                                            </Badge>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                                                                <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
                                                                <span className="font-medium">{habilidad.anios_experiencia} {habilidad.anios_experiencia === 1 ? 'año' : 'años'} de experiencia</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-2 border-dashed border-border bg-muted/20">
                                            <CardContent className="py-12 text-center">
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Award className="h-8 w-8 text-muted-foreground/40" />
                                                </div>
                                                <p className="text-foreground font-medium mb-1">No has agregado habilidades aún</p>
                                                <p className="text-muted-foreground text-sm mb-4">Agrega tus habilidades para destacar tu perfil</p>
                                                <Button onClick={() => setIsEditingHabilidad(true)} className="bg-gradient-to-r from-purple-600 to-purple-700">
                                                    <Plus className="w-4 h-4 mr-2" /> Agregar Primera Habilidad
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-card dark:from-blue-950/30">
                            <CardContent className="text-center py-16">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="h-10 w-10 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-3">Aún no has creado tu CV</h2>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Crea tu currículum profesional y destaca tus habilidades para conseguir mejores oportunidades laborales
                                </p>
                                <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-blue-700" size="lg">
                                    <Plus className="w-5 h-5" /> Crear Mi Currículum
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ── TAB: VALIDAR CV ── */}
                <TabsContent value="validar">
                    <CVValidarTab cvData={cvData} />
                </TabsContent>

                {/* ── TAB: COMPATIBILIDAD ── */}
                <TabsContent value="compatibilidad">
                    <CVCompatibilidadTab cvData={cvData} />
                </TabsContent>

                {/* ── TAB: SUBIR CV ── */}
                <TabsContent value="subir">
                    <CVSubirTab onCVImportado={fetchCVData} />
                </TabsContent>
            </Tabs>

            <ExperienciaDialog
                open={isAddingExperiencia}
                onOpenChange={setIsAddingExperiencia}
                cvId={cvData?.id ?? 0}
                initial={currentExperiencia}
                onSaved={fetchCVData}
            />
            <EducacionDialog
                open={isAddingEducacion}
                onOpenChange={setIsAddingEducacion}
                cvId={cvData?.id ?? 0}
                initial={currentEducacion}
                onSaved={fetchCVData}
            />
            <IdiomaDialog
                open={isAddingIdioma}
                onOpenChange={setIsAddingIdioma}
                cvId={cvData?.id ?? 0}
                initial={currentIdioma}
                onSaved={fetchCVData}
            />

            <CertificacionDialog
                open={isAddingCertificacion}
                onOpenChange={setIsAddingCertificacion}
                cvId={cvData?.id ?? 0}
                initial={currentCertificacion}
                onSaved={fetchCVData}
            />

            <CVDialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingCV={cvData}
                habilidadesIniciales={habilidades}
                onSubmit={handleSaveCV}
            />

            <CVOptimizarModal
                open={optimizarModalOpen}
                onOpenChange={setOptimizarModalOpen}
                isLoading={isOptimizing}
                resultado={optimizacionResultado}
                onAplicar={handleAplicarOptimizacion}
                isApplying={isApplyingOptimization}
            />
        </div>
    );
};
