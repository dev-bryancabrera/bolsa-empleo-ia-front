import { useNavigate } from 'react-router-dom'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent } from '@/core/components/ui/card'
import {
    FileText, TrendingUp, Briefcase, BookOpen, Map,
    Target, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react'

export const DashboardEmptyState = ({ nombre }: { nombre?: string }) => {
    const navigate = useNavigate()

    const previews = [
        {
            icon: Target,
            color: 'from-blue-500 to-blue-600',
            titulo: 'Análisis de Brechas',
            desc: 'Compara tu perfil actual con lo que el mercado exige y mide tu empleabilidad (0–100).'
        },
        {
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            titulo: 'Tendencias del Sector',
            desc: 'Descubre qué habilidades están en alta demanda para tu área profesional en Ecuador y Latam.'
        },
        {
            icon: Map,
            color: 'from-violet-500 to-purple-600',
            titulo: 'Ruta de Aprendizaje',
            desc: 'Recibe un plan personalizado con fases, recursos y tiempos para cerrar cada brecha.'
        },
        {
            icon: Briefcase,
            color: 'from-orange-500 to-orange-600',
            titulo: 'Empleos Sugeridos',
            desc: 'Ofertas laborales que coinciden con tu perfil, con tu match actual y potencial.'
        },
        {
            icon: BookOpen,
            color: 'from-pink-500 to-rose-600',
            titulo: 'Recomendaciones IA',
            desc: 'Cursos, certificaciones y plataformas seleccionadas específicamente para tu situación.'
        },
        {
            icon: Sparkles,
            color: 'from-amber-500 to-yellow-500',
            titulo: 'Insights Personalizados',
            desc: 'Tu ventaja competitiva, el riesgo principal y el siguiente paso más urgente para tu carrera.'
        },
    ]

    const pasos = [
        'Ve a "Mi Currículum" en el menú lateral',
        'Completa tus datos: título, experiencia, habilidades y educación',
        'También puedes subir tu CV en PDF para que el sistema lo procese',
        'Regresa aquí y pulsa "Analizar con IA" para ver todo tu panel personalizado'
    ]

    return (
        <div className="max-w-5xl mx-auto">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-2xl mb-8">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        {nombre ? `¡Hola ${nombre}!` : '¡Bienvenido!'} Tu dashboard te espera
                    </h1>
                    <p className="text-white/85 text-lg max-w-2xl mx-auto mb-6">
                        Para activar tu panel de inteligencia artificial necesitas registrar tu CV.
                        Con esa información la IA analiza tu perfil, detecta tus brechas y genera
                        una ruta personalizada para impulsar tu carrera.
                    </p>
                    <Button
                        onClick={() => navigate('/dashboard/cv')}
                        className="bg-white text-purple-700 hover:bg-purple-50 font-bold gap-2 shadow-xl px-8 py-3 text-base"
                    >
                        <FileText className="w-5 h-5" />
                        Crear mi CV ahora
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Pasos */}
            <Card className="border-0 shadow-xl mb-8 bg-gradient-to-br from-card to-muted/30">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">?</span>
                        ¿Cómo activo mi dashboard?
                    </h2>
                    <div className="space-y-3">
                        {pasos.map((paso, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{paso}</p>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard/cv')}
                        variant="outline"
                        className="mt-5 border-primary text-primary hover:bg-primary/10 gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Ir a Mi Currículum
                    </Button>
                </CardContent>
            </Card>

            {/* Preview de lo que verá */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-foreground mb-1">¿Qué verás una vez que agregues tu CV?</h2>
                <p className="text-muted-foreground text-sm">Vista previa de todo lo que la IA analizará para ti</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {previews.map((item, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl border-2 border-border bg-card p-5 opacity-75">
                        <div className="absolute inset-0 bg-muted/30" />
                        <div className="relative z-10">
                            <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                                <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-foreground mb-1">{item.titulo}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                        {/* Lock overlay */}
                        <div className="absolute top-3 right-3 bg-muted rounded-full px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                            🔒 Requiere CV
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
