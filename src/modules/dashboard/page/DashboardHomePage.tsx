import {
    ArrowUpRight, Sparkles, RefreshCw, TrendingUp, Zap, Target,
    Briefcase, Map, CheckCircle2, Circle, Clock, ChevronRight,
    AlertTriangle, ArrowUp
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserService } from '@/modules/users/services/UserService'
import { TendenciaService } from '@/modules/dashboard/services/TendenciaService'
import type { TendenciaData } from '@/modules/dashboard/types/TendenciaTypes'
import { RutaService } from '@/modules/chat/services/RutaService'
import type { RutaGuardada, RutaAprendizajeData } from '@/modules/chat/types/RutaType'
import { DashboardEmptyState } from '@/modules/dashboard/components/DashboardEmptyState'
import { useEffect, useState } from "react"
import { useAuthStore } from "@/modules/auth/services/AuthService"
import { useNavigate } from "react-router-dom"

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
        if (authUser?.id) fetchUserData();
    }, [authUser]);

    useEffect(() => {
        if (userData) {
            fetchTendencias();
            fetchRutaActiva(userData.id_persona);
        }
    }, [userData]);

    const fetchUserData = async () => {
        try {
            const data = await UserService.obtenerPersonaPorUsuario(authUser!.id);
            setUserData(data);
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRutaActiva = async (personaId: number) => {
        try {
            const rutas: RutaGuardada[] = await RutaService.listarPorPersona(personaId);
            const activa = rutas.find(r => r.estado === 'activa') || rutas[0];
            if (activa) {
                const data: RutaAprendizajeData = JSON.parse(activa.json_ruta);
                setRutaActiva({ guardada: activa, data });
            }
        } catch (_) { /* silencioso */ }
    };

    const fetchTendencias = async () => {
        setLoadingTendencias(true);
        try {
            const response = await TendenciaService.obtenerTendencias(userData.id_persona);
            setTendencias(response.data);
            setTieneCV(true);
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || '';
            if (msg.includes('CV_NOT_FOUND') || msg.includes('CV')) {
                setTieneCV(false);
            } else {
                setTieneCV(true);
            }
        } finally {
            setLoadingTendencias(false);
        }
    };

    const handleRegenerarTendencias = async () => {
        setRegenerando(true);
        try {
            const response = await TendenciaService.regenerarTendencias(userData.id_persona);
            setTendencias(response.data);
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || '';
            if (msg.includes('CV_NOT_FOUND') || msg.includes('CV')) setTieneCV(false);
        } finally {
            setRegenerando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando tu dashboard...</p>
                </div>
            </div>
        );
    }

    // Sin CV → vista informativa
    if (tieneCV === false) {
        return <DashboardEmptyState nombre={userData?.persona?.nombre} />;
    }

    const brecha = tendencias?.analisis_brecha;
    const empActual = brecha?.puntuacion_empleabilidad_actual ?? tendencias?.estadisticas?.match_promedio ?? null;
    const empPotencial = brecha?.puntuacion_empleabilidad_potencial ?? null;

    return (
        <>
            {/* Welcome */}
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Sparkles className="w-10 h-10 animate-pulse" />
                            ¡Hola {userData?.persona?.nombre}!
                        </h1>
                        <p className="text-white/90 text-lg">
                            Tu asistente IA ha preparado recomendaciones personalizadas para impulsar tu carrera
                        </p>
                    </div>
                    <Button
                        onClick={handleRegenerarTendencias}
                        disabled={regenerando || loadingTendencias}
                        className="bg-white dark:bg-white/90 text-purple-600 hover:bg-purple-50 gap-2 shadow-lg"
                    >
                        <RefreshCw className={cn("w-4 h-4", regenerando && "animate-spin")} />
                        {regenerando ? "Analizando..." : "Actualizar con IA"}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {loadingTendencias ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-0 shadow-lg animate-pulse">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 bg-muted rounded w-32" />
                                <div className="w-10 h-10 bg-muted rounded-lg" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-16 mb-2" />
                                <div className="h-3 bg-muted rounded w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : tendencias ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Empleabilidad actual */}
                    {empActual !== null && (
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/90">Empleabilidad Actual</CardTitle>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold text-white mb-1">{empActual}%</div>
                                {empPotencial && (
                                    <p className="text-sm text-white/80 flex items-center gap-1">
                                        <span className="flex items-center font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                                            <ArrowUp className="h-3 w-3 mr-1" />{empPotencial}%
                                        </span>
                                        <span>potencial</span>
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Brechas críticas */}
                    {brecha?.brechas_criticas && (
                        <Card
                            className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-rose-600 text-white overflow-hidden relative group cursor-pointer"
                            onClick={() => navigate('/dashboard/chat')}
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/90">Brechas Críticas</CardTitle>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold text-white mb-1">
                                    {brecha.brechas_criticas.filter(b => b.impacto_empleabilidad === 'Alto').length}
                                </div>
                                <p className="text-sm text-white/80">de impacto alto — clic para tu ruta</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ruta activa */}
                    {rutaActiva && (
                        <Card
                            className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative group cursor-pointer"
                            onClick={() => navigate('/dashboard/chat')}
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/90">Ruta Activa</CardTitle>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Map className="h-6 w-6 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold text-white mb-1">
                                    {(() => {
                                        let p: Record<string, boolean> = {};
                                        try { p = JSON.parse(rutaActiva.guardada.progreso_fases || '{}'); } catch (_) {}
                                        const t = rutaActiva.data.fases?.length || 0;
                                        return t > 0 ? Math.round((Object.values(p).filter(Boolean).length / t) * 100) : 0;
                                    })()}%
                                </div>
                                <p className="text-sm text-white/80 flex items-center gap-1">
                                    <span className="flex items-center font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                                        <Sparkles className="h-3 w-3 mr-1" />progreso
                                    </span>
                                    <span>completado</span>
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Match promedio */}
                    {tendencias.estadisticas && (
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-white/90">Habilidades</CardTitle>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-4xl font-bold text-white mb-1">
                                    {tendencias.estadisticas.habilidades_registradas}
                                </div>
                                <p className="text-sm text-white/80">registradas en tu CV</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : null}

            {/* Análisis de Brechas */}
            {brecha && (
                <Card className="border-0 shadow-xl mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 px-6 py-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            Análisis de Brechas Competenciales
                        </CardTitle>
                        <CardDescription className="mt-1">{brecha.resumen_brecha}</CardDescription>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Brechas críticas */}
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Brechas a cerrar</h4>
                                <div className="space-y-2">
                                    {brecha.brechas_criticas.slice(0, 5).map((b, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border-2 border-border bg-card hover:border-red-200 transition-colors">
                                            <Badge className={cn(
                                                'text-xs shrink-0',
                                                b.impacto_empleabilidad === 'Alto' && 'bg-red-500 text-white border-0',
                                                b.impacto_empleabilidad === 'Medio' && 'bg-yellow-500 text-white border-0',
                                                b.impacto_empleabilidad === 'Bajo' && 'bg-gray-400 text-white border-0',
                                            )}>
                                                {b.impacto_empleabilidad}
                                            </Badge>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{b.competencia}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {b.nivel_actual} → {b.nivel_requerido} · {b.tiempo_cierre_estimado}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Barra de empleabilidad */}
                            <div className="flex flex-col justify-center">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Tu progreso de empleabilidad</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-muted-foreground">Nivel actual</span>
                                            <span className="font-bold text-foreground">{brecha.puntuacion_empleabilidad_actual}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all duration-1000"
                                                style={{ width: `${brecha.puntuacion_empleabilidad_actual}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-muted-foreground">Potencial al cerrar brechas</span>
                                            <span className="font-bold text-green-600">{brecha.puntuacion_empleabilidad_potencial}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${brecha.puntuacion_empleabilidad_potencial}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                                        <ArrowUpRight className="w-5 h-5 text-green-600 shrink-0" />
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                            +{brecha.puntuacion_empleabilidad_potencial - brecha.puntuacion_empleabilidad_actual}% de mejora posible con tu ruta de aprendizaje
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => navigate('/dashboard/chat')}
                                    className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generar mi ruta personalizada
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ruta Activa Widget */}
            {rutaActiva && (() => {
                let progreso: Record<string, boolean> = {};
                try { progreso = JSON.parse(rutaActiva.guardada.progreso_fases || '{}'); } catch (_) {}
                const totalFases = rutaActiva.data.fases?.length || 0;
                const completadas = Object.values(progreso).filter(Boolean).length;
                const pct = totalFases > 0 ? Math.round((completadas / totalFases) * 100) : 0;
                const faseActualIdx = rutaActiva.data.fases?.findIndex((_, i) => !progreso[`${rutaActiva.data.objetivo_profesional}-fase-${i}`]);
                const faseActual = faseActualIdx !== undefined && faseActualIdx >= 0 ? rutaActiva.data.fases?.[faseActualIdx] : undefined;

                return (
                    <Card className="border-0 shadow-xl mb-6 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white relative">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                        <CardContent className="relative z-10 p-6">
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Map className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Mi Ruta Activa</span>
                                        <Badge className="bg-white/20 text-white border-white/30 text-xs ml-auto md:ml-0">
                                            {rutaActiva.guardada.estado}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-white leading-tight mb-1 mt-2 line-clamp-2">{rutaActiva.data.titulo}</h3>
                                    <p className="text-sm text-white/80 mb-4 line-clamp-1">{rutaActiva.data.objetivo_profesional}</p>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-white/80 mb-1.5">
                                            <span>Progreso general</span>
                                            <span className="font-bold text-white">{pct}% — {completadas}/{totalFases} fases</span>
                                        </div>
                                        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-white/90 to-white/70 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="flex items-center gap-1 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                                            <Clock className="w-3 h-3" />{rutaActiva.data.duracion_estimada_meses} meses
                                        </span>
                                        {rutaActiva.data.salario_esperado && (
                                            <span className="flex items-center gap-1 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                                                <TrendingUp className="w-3 h-3" />{rutaActiva.data.salario_esperado}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="md:w-64 flex-shrink-0">
                                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Fases</p>
                                    <div className="space-y-1.5 mb-4">
                                        {rutaActiva.data.fases?.slice(0, 5).map((fase, i) => {
                                            const key = `${rutaActiva.data.objetivo_profesional}-fase-${i}`;
                                            const done = progreso[key] === true;
                                            const isCurrent = i === faseActualIdx;
                                            return (
                                                <div key={i} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs', done ? 'bg-white/10 opacity-60' : isCurrent ? 'bg-white/25 font-semibold' : 'bg-white/10')}>
                                                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" /> : isCurrent ? <div className="w-3.5 h-3.5 rounded-full bg-white flex-shrink-0 animate-pulse" /> : <Circle className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />}
                                                    <span className={cn('text-white line-clamp-1', done && 'line-through')}>{fase.nombre}</span>
                                                </div>
                                            );
                                        })}
                                        {(rutaActiva.data.fases?.length || 0) > 5 && (
                                            <p className="text-xs text-white/50 px-3">+{rutaActiva.data.fases!.length - 5} fases más</p>
                                        )}
                                    </div>
                                    {faseActual && (
                                        <div className="bg-white/15 rounded-xl p-3 mb-3">
                                            <p className="text-xs text-white/70 mb-0.5">Próxima fase</p>
                                            <p className="text-sm font-bold text-white line-clamp-1">{faseActual.nombre}</p>
                                            {faseActual.nivel_dificultad && <p className="text-xs text-white/60 mt-0.5">{faseActual.nivel_dificultad}</p>}
                                        </div>
                                    )}
                                    <Button onClick={() => navigate('/dashboard/chat', { state: { rutaId: rutaActiva.guardada.id } })} className="w-full bg-white text-violet-700 hover:bg-violet-50 font-semibold gap-2 shadow-lg">
                                        Continuar en Mentor IA
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Recomendaciones IA */}
                <Card className="lg:col-span-2 border-0 shadow-xl bg-card overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    Habilidades en Demanda
                                </CardTitle>
                                <CardDescription className="mt-1">Lo que el mercado exige para tu perfil — y si ya lo tienes</CardDescription>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        {loadingTendencias ? (
                            <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
                        ) : tendencias?.habilidades_demandadas ? (
                            <div className="space-y-3">
                                {tendencias.habilidades_demandadas.slice(0, 6).map((hab, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card hover:border-purple-200 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-foreground">{hab.nombre}</span>
                                                <Badge className={cn('text-xs', hab.demanda === 'Alta' ? 'bg-red-500 text-white border-0' : hab.demanda === 'Media' ? 'bg-yellow-500 text-white border-0' : 'bg-blue-500 text-white border-0')}>
                                                    {hab.demanda}
                                                </Badge>
                                                {hab.el_usuario_la_tiene === true && (
                                                    <Badge className="bg-green-500 text-white border-0 text-xs">✓ Tienes</Badge>
                                                )}
                                                {hab.el_usuario_la_tiene === false && (
                                                    <Badge variant="outline" className="text-xs border-red-200 text-red-600">✗ Brecha</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${hab.porcentaje_ofertas}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">{hab.porcentaje_ofertas}% ofertas · {hab.tiempo_aprendizaje}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {/* Recomendaciones */}
                <Card className="border-0 shadow-xl bg-card overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-white">Recomendaciones IA</CardTitle>
                                <CardDescription className="text-white/80 text-sm">Basadas en tus brechas</CardDescription>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        {loadingTendencias ? (
                            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
                        ) : tendencias?.recomendaciones ? (
                            <div className="space-y-3">
                                {tendencias.recomendaciones.slice(0, 3).map((item, i) => (
                                    <div key={i} className="p-4 bg-card rounded-2xl border-2 border-border hover:border-purple-300 hover:shadow-lg transition-all group">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs mb-1 border-0">{item.tipo}</Badge>
                                                <h4 className="font-bold text-sm text-foreground mb-1">{item.titulo}</h4>
                                                <p className="text-xs text-muted-foreground mb-2">{item.razon}</p>
                                                {item.url ? (
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" className="h-7 text-xs px-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                            {item.accion} →
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <Button size="sm" disabled className="h-7 text-xs px-3 w-full">{item.accion}</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <Button onClick={handleRegenerarTendencias} disabled={regenerando} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Sparkles className="w-4 h-4 mr-2" />
                            {regenerando ? 'Analizando...' : 'Actualizar análisis'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Roles Recomendados */}
            {tendencias?.empleos_sugeridos && tendencias.empleos_sugeridos.length > 0 && (
                <Card className="border-0 shadow-xl mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 px-6 py-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            Roles Recomendados para Tu Perfil
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Roles identificados por la IA según tu perfil — busca vacantes reales en las plataformas
                        </CardDescription>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tendencias.empleos_sugeridos.slice(0, 4).map((empleo, i) => {
                                const matchShow = empleo.match_actual ?? empleo.match;
                                const matchPot = empleo.match_potencial;
                                const q = encodeURIComponent(empleo.titulo);
                                const loc = encodeURIComponent(empleo.ubicacion || 'Ecuador');
                                const slug = empleo.titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                const links = [
                                    { label: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}&f_TPR=r604800&sortBy=DD`, color: 'text-blue-600 border-blue-200 hover:bg-blue-50' },
                                    { label: 'Computrabajo', url: `https://ec.computrabajo.com/trabajo-de-${slug}`, color: 'text-orange-600 border-orange-200 hover:bg-orange-50' },
                                    { label: 'Indeed', url: `https://ec.indeed.com/empleos?q=${q}&l=${encodeURIComponent(empleo.ubicacion || 'Ecuador')}&fromage=7`, color: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' },
                                ];
                                return (
                                    <div key={i} className="p-5 border-2 border-border rounded-2xl hover:border-green-300 hover:shadow-xl transition-all group bg-card flex flex-col">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-foreground group-hover:text-green-600 transition-colors">{empleo.titulo}</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">📍 {empleo.ubicacion}</p>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold block mb-1">
                                                    {matchShow}% ahora
                                                </Badge>
                                                {matchPot && <Badge variant="outline" className="border-green-300 text-green-600 text-xs">{matchPot}% potencial</Badge>}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">{empleo.modalidad}</Badge>
                                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">{empleo.nivel}</Badge>
                                            <span className="text-xs font-semibold text-green-600">{empleo.salario_estimado}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{empleo.razon_match}</p>
                                        {empleo.brechas_para_aplicar && empleo.brechas_para_aplicar.length > 0 && (
                                            <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                                                <p className="text-xs font-semibold text-orange-600 mb-1">Para postular necesitas:</p>
                                                <p className="text-xs text-orange-700 dark:text-orange-400">{empleo.brechas_para_aplicar[0]}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-3 border-t">
                                            {links.map(link => (
                                                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <Button size="sm" variant="outline" className={cn('w-full h-7 text-xs px-1', link.color)}>
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

            {/* Plataformas */}
            {tendencias?.plataformas_recomendadas && tendencias.plataformas_recomendadas.length > 0 && (
                <Card className="border-0 shadow-xl mb-6">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Plataformas Recomendadas
                        </CardTitle>
                        <CardDescription>Ideales para encontrar oportunidades en tu sector</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tendencias.plataformas_recomendadas.slice(0, 4).map((plataforma, i) => (
                                <a key={i} href={plataforma.url} target="_blank" rel="noopener noreferrer"
                                    className="p-5 border-2 border-border rounded-2xl hover:border-purple-300 hover:shadow-xl transition-all group bg-gradient-to-br from-card to-purple-50 dark:to-purple-950/30">
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                            <span className="text-2xl">🚀</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{plataforma.nombre}</p>
                                            <Badge className="bg-purple-100 text-purple-700 text-xs mt-1 border-0">{plataforma.tipo}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{plataforma.razon}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Insights personalizados */}
            {tendencias?.insights_personalizados && (
                <Card className="border-0 shadow-xl mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Insights Personalizados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tendencias.insights_personalizados.ventaja_competitiva && (
                                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Tu ventaja competitiva</p>
                                    <p className="text-sm text-green-800 dark:text-green-300">{tendencias.insights_personalizados.ventaja_competitiva}</p>
                                </div>
                            )}
                            {(tendencias.insights_personalizados.riesgo_principal || tendencias.insights_personalizados.siguiente_paso) && (
                                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Riesgo principal</p>
                                    <p className="text-sm text-red-800 dark:text-red-300">
                                        {tendencias.insights_personalizados.riesgo_principal || tendencias.insights_personalizados.siguiente_paso}
                                    </p>
                                </div>
                            )}
                            {(tendencias.insights_personalizados.siguiente_paso_urgente || tendencias.insights_personalizados.plazo_para_ser_competitivo) && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 md:col-span-2">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Siguiente paso urgente</p>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        {tendencias.insights_personalizados.siguiente_paso_urgente || tendencias.insights_personalizados.plazo_para_ser_competitivo}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
