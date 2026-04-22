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
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { CVService } from '@/modules/cv/services/CVService';
import { CVDialog } from '../components/CVDialog';
import { HabilidadService } from '../services/HabilidadService';
import { CVValidarTab } from '../components/CVValidarTab';
import { CVCompatibilidadTab } from '../components/CVCompatibilidadTab';
import { CVSubirTab } from '../components/CVSubirTab';
import { printCV } from '../components/CVPrintTemplate';
import {
    ExperienciaService,
    EducacionService,
    IdiomaService,
    CertificacionService,
} from '../services/CVSectionService';
import type { ExperienciaLaboral, Educacion, Idioma, Certificacion } from '../types/CVType';

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
        fetchCVData();
        setIsModalOpen(false);
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
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => printCV({
                                        cvData,
                                        userName: authUser?.nombre ?? authUser?.name ?? '',
                                        userEmail: authUser?.email ?? '',
                                        habilidades,
                                        experiencias,
                                        educaciones,
                                        idiomas,
                                        certificaciones,
                                    })}
                                    className="gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimir CV
                                </Button>
                                <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-yellow-500 hover:bg-yellow-600">
                                    ✏️ Editar CV
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
                            {experiencias.length > 0 && (
                                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-green-50 to-card dark:from-green-950/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-green-600" />
                                            Experiencia Laboral
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">{experiencias.length}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
                                                            </div>
                                                        </div>
                                                        {exp.descripcion && <p className="text-sm text-muted-foreground mt-2">{exp.descripcion}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Educación */}
                            {educaciones.length > 0 && (
                                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-purple-50 to-card dark:from-purple-950/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-purple-600" />
                                            Educación
                                            <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">{educaciones.length}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
                                                            </div>
                                                        </div>
                                                        {edu.descripcion && <p className="text-sm text-muted-foreground mt-2">{edu.descripcion}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Idiomas */}
                            {idiomas.length > 0 && (
                                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-blue-50 to-card dark:from-blue-950/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <Languages className="h-5 w-5 text-blue-600" />
                                            Idiomas
                                            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">{idiomas.length}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-3">
                                            {idiomas.map((idioma) => (
                                                <div key={idioma.id} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getIdiomaColor(idioma.nivel)} shadow-sm`}>
                                                    <Languages className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">{idioma.nombre}</span>
                                                    <span className="text-xs font-medium opacity-80">— {idioma.nivel}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Certificaciones */}
                            {certificaciones.length > 0 && (
                                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-yellow-50 to-card dark:from-yellow-950/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <BadgeCheck className="h-5 w-5 text-yellow-600" />
                                            Certificaciones
                                            <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">{certificaciones.length}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Habilidades */}
                            <Card className="border-0 shadow-lg bg-card">
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

            <CVDialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingCV={cvData}
                habilidadesIniciales={habilidades}
                onSubmit={handleSaveCV}
            />
        </div>
    );
};
