import { useState } from 'react'
import {
    BarChart2, Loader2, Sparkles, Send, Users, Briefcase,
    Code2, GraduationCap, Lightbulb, TrendingUp, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { AdminAnalisisService } from '@/modules/dashboard/services/AdminAnalisisService'
import { toast } from 'react-toastify'

const CONSULTAS_SUGERIDAS = [
    '¿Cuáles son las profesiones más comunes en la plataforma?',
    '¿Qué habilidades técnicas predominan entre los usuarios?',
    '¿Cómo es la distribución de nivel de experiencia (junior, mid, senior)?',
    '¿Qué sectores profesionales tienen más CVs registrados?',
    '¿Cuáles son los CVs mejor estructurados y por qué?',
]

interface Analisis {
    total_cvs: number
    resumen_general: string
    respuesta_consulta: string
    profesiones_top: { nombre: string; cantidad: number; porcentaje: number }[]
    sectores_top: { sector: string; cantidad: number }[]
    habilidades_mas_comunes: { habilidad: string; cantidad: number }[]
    distribucion_experiencia: { junior_0_2: number; mid_3_5: number; senior_6_mas: number }
    distribucion_educacion: { basica: number; tecnico: number; universitario: number; postgrado: number }
    insights: string[]
    recomendaciones: string
}

export const AdminCVAnalysisPage = () => {
    const [consulta, setConsulta] = useState('')
    const [analisis, setAnalisis] = useState<Analisis | null>(null)
    const [loading, setLoading] = useState(false)

    const ejecutar = async (q?: string) => {
        const pregunta = q ?? consulta
        setLoading(true)
        try {
            const data = await AdminAnalisisService.analizarCVs(pregunta || undefined)
            setAnalisis(data)
            if (q) setConsulta(q)
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Error al analizar los CVs')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-violet-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Análisis IA de CVs</h1>
                    <p className="text-sm text-muted-foreground">Consulta tendencias y patrones de todos los CVs registrados</p>
                </div>
            </div>

            {/* Query input */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        Haz una pregunta sobre los CVs
                    </CardTitle>
                    <CardDescription>La IA analizará todos los CVs registrados para responderte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={consulta}
                            onChange={e => setConsulta(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !loading && ejecutar()}
                            placeholder="Ej: ¿Cuáles son las habilidades más comunes?"
                            className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <Button
                            onClick={() => ejecutar()}
                            disabled={loading}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2 px-5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {loading ? 'Analizando...' : 'Analizar'}
                        </Button>
                    </div>

                    {/* Suggested queries */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Consultas sugeridas:</p>
                        <div className="flex flex-wrap gap-2">
                            {CONSULTAS_SUGERIDAS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => ejecutar(q)}
                                    disabled={loading}
                                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-colors disabled:opacity-50"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center h-48">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground">La IA está analizando los CVs...</p>
                    </div>
                </div>
            )}

            {/* Results */}
            {!loading && analisis && (
                <div className="space-y-5">
                    {/* Summary row */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total CVs', value: analisis.total_cvs, icon: Users, color: 'bg-blue-100 text-blue-700' },
                            { label: 'Profesiones únicas', value: analisis.profesiones_top?.length ?? 0, icon: Briefcase, color: 'bg-green-100 text-green-700' },
                            { label: 'Habilidades top', value: analisis.habilidades_mas_comunes?.length ?? 0, icon: Code2, color: 'bg-amber-100 text-amber-700' },
                            { label: 'Sectores', value: analisis.sectores_top?.length ?? 0, icon: TrendingUp, color: 'bg-violet-100 text-violet-700' },
                        ].map((s, i) => (
                            <Card key={i} className="border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</span>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>
                                            <s.icon className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* AI response to query */}
                    {analisis.respuesta_consulta && (
                        <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
                            <CardContent className="p-5">
                                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Respuesta de la IA
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">{analisis.respuesta_consulta}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Resumen general */}
                    {analisis.resumen_general && (
                        <Card className="border-border">
                            <CardContent className="p-5">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resumen general</p>
                                <p className="text-sm text-foreground leading-relaxed">{analisis.resumen_general}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Profesiones top */}
                        {analisis.profesiones_top?.length > 0 && (
                            <Card className="border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                        Profesiones más comunes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-2">
                                    {analisis.profesiones_top.slice(0, 6).map((p, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-medium text-foreground truncate">{p.nombre}</span>
                                                    <span className="text-muted-foreground shrink-0 ml-2">{p.cantidad}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.porcentaje}%` }} />
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-blue-600 shrink-0 w-10 text-right">{p.porcentaje}%</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Habilidades top */}
                        {analisis.habilidades_mas_comunes?.length > 0 && (
                            <Card className="border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-amber-500" />
                                        Habilidades más frecuentes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex flex-wrap gap-2">
                                        {analisis.habilidades_mas_comunes.slice(0, 12).map((h, i) => (
                                            <Badge key={i} className="bg-amber-100 text-amber-800 border-0 text-xs">
                                                {h.habilidad} · {h.cantidad}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Distribución experiencia */}
                        {analisis.distribucion_experiencia && (
                            <Card className="border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        Distribución por experiencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-2">
                                    {[
                                        { label: 'Junior (0-2 años)', value: analisis.distribucion_experiencia.junior_0_2, color: 'bg-blue-400' },
                                        { label: 'Mid (3-5 años)', value: analisis.distribucion_experiencia.mid_3_5, color: 'bg-violet-500' },
                                        { label: 'Senior (6+ años)', value: analisis.distribucion_experiencia.senior_6_mas, color: 'bg-green-500' },
                                    ].map((d, i) => {
                                        const total = analisis.total_cvs || 1
                                        return (
                                            <div key={i} className="flex items-center gap-3 text-xs">
                                                <span className="w-32 text-muted-foreground shrink-0">{d.label}</span>
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${(d.value / total) * 100}%` }} />
                                                </div>
                                                <span className="font-semibold text-foreground w-6 text-right">{d.value}</span>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )}

                        {/* Distribución educación */}
                        {analisis.distribucion_educacion && (
                            <Card className="border-border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-violet-500" />
                                        Distribución por educación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-2">
                                    {[
                                        { label: 'Básica', value: analisis.distribucion_educacion.basica },
                                        { label: 'Técnico', value: analisis.distribucion_educacion.tecnico },
                                        { label: 'Universitario', value: analisis.distribucion_educacion.universitario },
                                        { label: 'Postgrado', value: analisis.distribucion_educacion.postgrado },
                                    ].map((d, i) => {
                                        const total = analisis.total_cvs || 1
                                        return (
                                            <div key={i} className="flex items-center gap-3 text-xs">
                                                <span className="w-24 text-muted-foreground shrink-0">{d.label}</span>
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(d.value / total) * 100}%` }} />
                                                </div>
                                                <span className="font-semibold text-foreground w-6 text-right">{d.value}</span>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Insights */}
                    {analisis.insights?.length > 0 && (
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    Insights clave
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
                                {analisis.insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-sm">
                                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                                        <p className="text-foreground leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recomendaciones */}
                    {analisis.recomendaciones && (
                        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                            <CardContent className="p-5">
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                    <RefreshCw className="w-3.5 h-3.5" /> Recomendaciones para la plataforma
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">{analisis.recomendaciones}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
