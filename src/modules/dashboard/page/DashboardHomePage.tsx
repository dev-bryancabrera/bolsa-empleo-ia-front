import {
    RefreshCw, TrendingUp, Target, Briefcase,
    CheckCircle2, Circle, Clock, ChevronRight,
    AlertTriangle, ArrowUpRight, Zap, BookOpen,
    Map, Sparkles, ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserService } from '@/modules/users/services/UserService'
import { TendenciaService } from '@/modules/dashboard/services/TendenciaService'
import type { TendenciaData, Recomendacion } from '@/modules/dashboard/types/TendenciaTypes'
import { RutaService } from '@/modules/chat/services/RutaService'
import type { RutaGuardada, RutaAprendizajeData } from '@/modules/chat/types/RutaType'
import { DashboardEmptyState } from '@/modules/dashboard/components/DashboardEmptyState'
import { AdminDashboard } from '@/modules/dashboard/components/AdminDashboard'
import { useEffect, useState } from "react"
import { useAuthStore } from "@/modules/auth/services/AuthService"
import { useNavigate } from "react-router-dom"

// Genera una URL de búsqueda real para una recomendación
function resolveRecUrl(rec: Recomendacion): string {
    const q = encodeURIComponent(rec.brecha_que_cierra || rec.titulo);
    const year = new Date().getFullYear();

    // Si la IA ya dio una URL de búsqueda válida, verificar que sea de plataforma conocida
    if (rec.url) {
        const u = rec.url.toLowerCase();
        if (u.includes('udemy.com/courses/search') || u.includes('coursera.org/search') ||
            u.includes('platzi.com/cursos') || u.includes('youtube.com/results') ||
            u.includes('linkedin.com/learning')) {
            return rec.url;
        }
    }

    // Generar URL de búsqueda según plataforma o tipo
    const plat = rec.plataforma;
    if (plat === 'Coursera' || rec.tipo === 'Certificación')
        return `https://www.coursera.org/search?query=${q}&sortBy=NEW`;
    if (plat === 'Platzi')
        return `https://platzi.com/cursos/?search=${q}`;
    if (plat === 'YouTube')
        return `https://www.youtube.com/results?search_query=${q}+tutorial+${year}&sp=EgQIBBAB`;
    if (plat === 'LinkedIn_Learning' || rec.tipo === 'Red_profesional')
        return `https://www.linkedin.com/learning/search?keywords=${q}`;
    // Udemy por defecto para Curso/Proyecto
    return `https://www.udemy.com/courses/search/?q=${q}&sort=newest`;
}

const PLAT_LABEL: Record<string, string> = {
    Udemy: 'Buscar en Udemy',
    Coursera: 'Buscar en Coursera',
    Platzi: 'Buscar en Platzi',
    YouTube: 'Ver en YouTube',
    LinkedIn_Learning: 'LinkedIn Learning',
};

export const DashboardHomePage = () => {
    const authUser = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [tieneCV, setTieneCV] = useState<boolean | null>(null);
    const [tendencias, setTendencias] = useState<TendenciaData | null>(null);
    const [rutaActiva, setRutaActiva] = useState<{ guardada: RutaGuardada; data: RutaAprendizajeData } | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingTendencias, setLoadingTendencias] = useState(false);
    const [regenerando, setRegenerando] = useState(false);

    useEffect(() => {
        if (!authUser?.id) return;
        if (authUser.rol === 'admin') {
            setLoading(false);
            return;
        }
        fetchUserData();
    }, [authUser]);

    useEffect(() => {
        if (!userData) return;
        if (!userData.id_persona) {
            setTieneCV(false);
            return;
        }
        fetchTendencias();
        fetchRutaActiva(userData.id_persona);
    }, [userData]);

    const fetchUserData = async () => {
        try {
            const data = await UserService.obtenerPersonaPorUsuario(authUser!.id);
            setUserData(data);
        } catch { /* silencioso */ } finally { setLoading(false); }
    };

    const fetchRutaActiva = async (personaId: number) => {
        try {
            const rutas: RutaGuardada[] = await RutaService.listarPorPersona(personaId);
            const activa = rutas.find(r => r.estado === 'activa') || rutas[0];
            if (activa) {
                const data: RutaAprendizajeData = JSON.parse(activa.json_ruta);
                setRutaActiva({ guardada: activa, data });
            }
        } catch { /* silencioso */ }
    };

    const esCVNotFound = (error: any) => {
        if (error?.response?.status === 404) return true;
        if (error?.response?.data?.codigo === 'CV_NOT_FOUND') return true;
        const msg = (
            error?.response?.data?.codigo ||
            error?.response?.data?.mensaje ||
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message || ''
        ).toLowerCase();
        return msg.includes('cv') && (msg.includes('encontr') || msg.includes('not found'));
    };

    const fetchTendencias = async () => {
        setLoadingTendencias(true);
        try {
            const response = await TendenciaService.obtenerTendencias(userData.id_persona);
            setTendencias(response.data);
            setTieneCV(true);
        } catch (error: any) {
            if (esCVNotFound(error)) setTieneCV(false);
            else setTieneCV(true);
        } finally { setLoadingTendencias(false); }
    };

    const handleRegenerarTendencias = async () => {
        setRegenerando(true);
        try {
            const response = await TendenciaService.regenerarTendencias(userData.id_persona);
            setTendencias(response.data);
        } catch (error: any) {
            if (esCVNotFound(error)) setTieneCV(false);
        } finally { setRegenerando(false); }
    };

    if (authUser?.rol === 'admin') return <AdminDashboard />;

    if (loading || tieneCV === null) return (
        <div className="flex items-center justify-center h-80">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Cargando tu dashboard...</p>
            </div>
        </div>
    );

    if (tieneCV === false) return <DashboardEmptyState nombre={userData?.persona?.nombre} />;

    const brecha = tendencias?.analisis_brecha;
    const empActual = brecha?.puntuacion_empleabilidad_actual ?? tendencias?.estadisticas?.match_promedio ?? null;
    const empPotencial = brecha?.puntuacion_empleabilidad_potencial ?? null;
    const breachasAltas = brecha?.brechas_criticas?.filter(b => b.impacto_empleabilidad === 'Alto').length ?? 0;
    const habCount = tendencias?.estadisticas?.habilidades_registradas ?? 0;

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Hola, {userData?.persona?.nombre} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tendencias
                            ? 'Tu análisis de mercado está listo — basado en tu CV y habilidades actuales'
                            : 'Preparando tu análisis personalizado...'}
                    </p>
                </div>
                <Button
                    onClick={handleRegenerarTendencias}
                    disabled={regenerando || loadingTendencias}
                    variant="outline"
                    className="gap-2 shrink-0"
                >
                    <RefreshCw className={cn("w-4 h-4", regenerando && "animate-spin")} />
                    {regenerando ? 'Analizando...' : 'Actualizar análisis'}
                </Button>
            </div>

            {/* ── Skeleton ── */}
            {loadingTendencias && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-5">
                                <div className="h-3 bg-muted rounded w-24 mb-3" />
                                <div className="h-8 bg-muted rounded w-16 mb-2" />
                                <div className="h-2 bg-muted rounded w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Stat cards ── */}
            {!loadingTendencias && tendencias && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {empActual !== null && (
                        <Card className="border-border">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Empleabilidad actual</span>
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-primary" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-foreground">{empActual}%</p>
                                {empPotencial && (
                                    <div className="mt-2 space-y-1">
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${empActual}%` }} />
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                                            Potencial: <span className="text-green-600 font-semibold">{empPotencial}%</span> cerrando brechas
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card
                        className={cn("border-border cursor-pointer hover:border-red-200 transition-colors", breachasAltas > 0 && "border-red-100")}
                        onClick={() => navigate('/dashboard/chat')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brechas de alto impacto</span>
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{breachasAltas}</p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                <ChevronRight className="w-3 h-3" />Generar ruta de aprendizaje
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Habilidades en tu CV</span>
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{habCount}</p>
                            <p className="text-xs text-muted-foreground mt-1.5">registradas en tu perfil</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Brechas resumen ── */}
            {!loadingTendencias && brecha && brecha.resumen_brecha && (
                <Card className="border-border">
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resumen del análisis</p>
                        <p className="text-sm text-foreground leading-relaxed">{brecha.resumen_brecha}</p>
                    </CardContent>
                </Card>
            )}

            {/* ── Skills + Recomendaciones ── */}
            {!loadingTendencias && tendencias && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Habilidades demandadas */}
                    {tendencias.habilidades_demandadas?.length > 0 && (
                        <Card className="lg:col-span-2 border-border">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Lo que el mercado exige</CardTitle>
                                        <CardDescription className="text-xs">Habilidades más solicitadas para tu perfil y si ya las tienes</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {tendencias.habilidades_demandadas.slice(0, 7).map((hab, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-foreground">{hab.nombre}</span>
                                                    <Badge className={cn(
                                                        'text-xs px-1.5 py-0 border-0',
                                                        hab.demanda === 'Alta' ? 'bg-red-100 text-red-700' :
                                                            hab.demanda === 'Media' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {hab.demanda}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${hab.porcentaje_ofertas}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{hab.porcentaje_ofertas}% · {hab.tiempo_aprendizaje}</span>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {hab.el_usuario_la_tiene === true
                                                    ? <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Tienes</span>
                                                    : hab.el_usuario_la_tiene === false
                                                        ? <span className="text-xs font-semibold text-red-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />Brecha</span>
                                                        : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recomendaciones */}
                    {tendencias.recomendaciones?.length > 0 && (
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Próximos pasos</CardTitle>
                                        <CardDescription className="text-xs">Acciones para cerrar tus brechas principales</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                                {tendencias.recomendaciones.slice(0, 4).map((rec, i) => {
                                    const url = resolveRecUrl(rec);
                                    const platLabel = rec.plataforma ? (PLAT_LABEL[rec.plataforma] ?? rec.accion) : rec.accion;
                                    return (
                                        <div key={i} className="p-3 rounded-xl border border-border hover:border-violet-200 transition-colors">
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-xl shrink-0 mt-0.5">{rec.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground leading-tight mb-1">{rec.titulo}</p>
                                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{rec.razon}</p>
                                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 w-full">
                                                            <ExternalLink className="w-3 h-3" />
                                                            {platLabel}
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-muted-foreground gap-1"
                                    onClick={() => navigate('/dashboard/chat')}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                                    Generar ruta personalizada con IA
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ── Roles para explorar ── */}
            {!loadingTendencias && tendencias?.empleos_sugeridos?.length > 0 && (
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-green-700" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Roles que encajan con tu perfil</CardTitle>
                                <CardDescription className="text-xs">
                                    Identificados por la IA según tus habilidades — usa los botones para buscar vacantes reales en cada plataforma
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tendencias.empleos_sugeridos.slice(0, 4).map((empleo, i) => {
                                const matchShow = empleo.match_actual ?? empleo.match;
                                const q = encodeURIComponent(empleo.titulo);
                                const loc = encodeURIComponent(empleo.ubicacion || 'Ecuador');
                                const links = [
                                    { label: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}&f_TPR=r604800&sortBy=DD` },
                                    { label: 'Computrabajo', url: `https://ec.computrabajo.com/?q=${q}` },
                                    { label: 'Indeed', url: `https://ec.indeed.com/empleos?q=${q}&l=${loc}&fromage=7` },
                                ];
                                return (
                                    <div key={i} className="p-4 rounded-xl border border-border hover:border-green-200 transition-colors">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-foreground leading-tight">{empleo.titulo}</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">📍 {empleo.ubicacion}</p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700 border-0 text-xs font-bold shrink-0">
                                                {matchShow}% match
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1.5 mb-3">
                                            <Badge variant="outline" className="text-xs">{empleo.modalidad}</Badge>
                                            <Badge variant="outline" className="text-xs">{empleo.nivel}</Badge>
                                            {empleo.salario_estimado && (
                                                <span className="text-xs text-green-700 font-medium">{empleo.salario_estimado}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{empleo.razon_match}</p>
                                        <div className="flex gap-1.5">
                                            {links.map(link => (
                                                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                                                        {link.label}
                                                    </Button>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Insights + Ruta activa ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Insights */}
                {!loadingTendencias && tendencias?.insights_personalizados && (
                    <Card className="border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-amber-600" />
                                </div>
                                <CardTitle className="text-base">Tu perfil en el mercado</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            {tendencias.insights_personalizados.ventaja_competitiva && (
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
                                    <p className="text-xs font-semibold text-green-700 mb-1">Ventaja competitiva</p>
                                    <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{tendencias.insights_personalizados.ventaja_competitiva}</p>
                                </div>
                            )}
                            {(tendencias.insights_personalizados.riesgo_principal) && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900">
                                    <p className="text-xs font-semibold text-red-600 mb-1">Riesgo principal</p>
                                    <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">{tendencias.insights_personalizados.riesgo_principal}</p>
                                </div>
                            )}
                            {(tendencias.insights_personalizados.siguiente_paso_urgente || tendencias.insights_personalizados.plazo_para_ser_competitivo) && (
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                                    <p className="text-xs font-semibold text-blue-600 mb-1">Siguiente paso urgente</p>
                                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                                        {tendencias.insights_personalizados.siguiente_paso_urgente || tendencias.insights_personalizados.plazo_para_ser_competitivo}
                                    </p>
                                </div>
                            )}
                            <Button variant="outline" className="w-full gap-2" onClick={handleRegenerarTendencias} disabled={regenerando}>
                                <RefreshCw className={cn("w-3.5 h-3.5", regenerando && "animate-spin")} />
                                {regenerando ? 'Analizando...' : 'Regenerar análisis'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Ruta activa */}
                {rutaActiva && (() => {
                    let progreso: Record<string, boolean> = {};
                    try { progreso = JSON.parse(rutaActiva.guardada.progreso_fases || '{}'); } catch { /* */ }
                    const totalFases = rutaActiva.data.fases?.length || 0;
                    const completadas = Object.values(progreso).filter(Boolean).length;
                    const pct = totalFases > 0 ? Math.round((completadas / totalFases) * 100) : 0;
                    const faseActualIdx = rutaActiva.data.fases?.findIndex((_, i) => !progreso[`${rutaActiva.data.objetivo_profesional}-fase-${i}`]) ?? -1;
                    const faseActual = faseActualIdx >= 0 ? rutaActiva.data.fases?.[faseActualIdx] : undefined;

                    return (
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                        <Map className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate">{rutaActiva.data.titulo}</CardTitle>
                                        <CardDescription className="text-xs">{rutaActiva.data.objetivo_profesional}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-xs shrink-0">{rutaActiva.guardada.estado}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                        <span>Progreso</span>
                                        <span className="font-semibold text-foreground">{pct}% — {completadas}/{totalFases} fases</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    {rutaActiva.data.fases?.slice(0, 4).map((fase, i) => {
                                        const key = `${rutaActiva.data.objetivo_profesional}-fase-${i}`;
                                        const done = progreso[key] === true;
                                        const isCurrent = i === faseActualIdx;
                                        return (
                                            <div key={i} className={cn('flex items-center gap-2 text-sm', done ? 'opacity-50' : '')}>
                                                {done
                                                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                    : isCurrent
                                                        ? <div className="w-4 h-4 rounded-full bg-violet-500 shrink-0 animate-pulse" />
                                                        : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                                                <span className={cn('line-clamp-1', done && 'line-through text-muted-foreground')}>{fase.nombre}</span>
                                            </div>
                                        );
                                    })}
                                    {(rutaActiva.data.fases?.length || 0) > 4 && (
                                        <p className="text-xs text-muted-foreground pl-6">+{rutaActiva.data.fases!.length - 4} fases más</p>
                                    )}
                                </div>
                                {faseActual && (
                                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
                                        <p className="text-xs text-violet-600 font-semibold mb-0.5">Próxima fase</p>
                                        <p className="text-sm font-medium text-foreground">{faseActual.nombre}</p>
                                    </div>
                                )}
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rutaActiva.data.duracion_estimada_meses} meses</span>
                                    {rutaActiva.data.salario_esperado && (
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{rutaActiva.data.salario_esperado}</span>
                                    )}
                                </div>
                                <Button
                                    onClick={() => navigate('/dashboard/chat', { state: { rutaId: rutaActiva.guardada.id } })}
                                    className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    Continuar en Mentor IA
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })()}
            </div>
        </div>
    );
};
