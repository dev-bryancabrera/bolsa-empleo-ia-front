import {
    ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserService } from '@/modules/users/services/UserService';
import { useEffect, useState } from "react";
import { useAuthStore } from "@/modules/auth/services/AuthService"

export const DashboardHomePage = () => {

    const authUser = useAuthStore((state) => state.user);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [authUser])

    const fetchUserData = async () => {
        if (authUser?.id) {
            try {
                const data = await UserService.obtenerPersonaPorUsuario(authUser.id);

                setUserData(data);

            } catch (error) {
                console.error("Error cargando datos de persona en Dashboard: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            ¡Hola {userData?.persona?.nombre}! 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Impulsa tu carrera profesional con recomendaciones personalizadas
                        </p>
                    </div>
                    {/* <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Explorar Empleos
                    </Button> */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Habilidades Registradas
                        </CardTitle>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">12</div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center">
                            <span className="text-green-600 flex items-center font-medium">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +3
                            </span>
                            <span className="ml-1">este mes</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Postulaciones Activas
                        </CardTitle>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">7</div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center">
                            <span className="text-blue-600 flex items-center font-medium">
                                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                5
                            </span>
                            <span className="ml-1">en revisión</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Rutas de Aprendizaje
                        </CardTitle>
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">3</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            <span className="text-orange-600 font-medium">
                                Generadas por IA
                            </span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Match Promedio
                        </CardTitle>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">78%</div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center">
                            <span className="text-green-600 flex items-center font-medium">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +12%
                            </span>
                            <span className="ml-1">vs mes anterior</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* AI Learning Paths */}
                <Card className="lg:col-span-2 border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Rutas de Aprendizaje Sugeridas
                                </CardTitle>
                                <CardDescription>Generadas por IA según tu perfil y objetivos</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                Ver todas
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    nombre: "Desarrollador Frontend Senior",
                                    habilidades: ["React", "TypeScript", "Testing"],
                                    gap: "4 habilidades",
                                    tiempo: "3-4 meses",
                                    prioridad: "Alta",
                                    color: "blue",
                                    match: 65
                                },
                                {
                                    nombre: "Full Stack Developer",
                                    habilidades: ["Node.js", "PostgreSQL", "Docker"],
                                    gap: "6 habilidades",
                                    tiempo: "5-6 meses",
                                    prioridad: "Media",
                                    color: "purple",
                                    match: 55
                                },
                                {
                                    nombre: "DevOps Engineer",
                                    habilidades: ["Kubernetes", "CI/CD", "AWS"],
                                    gap: "8 habilidades",
                                    tiempo: "6-8 meses",
                                    prioridad: "Baja",
                                    color: "orange",
                                    match: 40
                                },
                            ].map((ruta, index) => (
                                <div key={index} className="group p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                    {ruta.nombre}
                                                </h4>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        ruta.prioridad === "Alta" && "border-red-300 text-red-700 bg-red-50",
                                                        ruta.prioridad === "Media" && "border-yellow-300 text-yellow-700 bg-yellow-50",
                                                        ruta.prioridad === "Baja" && "border-gray-300 text-gray-700 bg-gray-50"
                                                    )}
                                                >
                                                    Prioridad {ruta.prioridad}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {ruta.habilidades.map((hab, i) => (
                                                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                                                        {hab}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {ruta.tiempo}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    {ruta.gap} por desarrollar
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" className="gap-2 ml-4">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            Iniciar
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Match con tu perfil</span>
                                            <span className="font-semibold text-primary">{ruta.match}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r ${ruta.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                    ruta.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                                        'from-orange-500 to-orange-600'
                                                    }`}
                                                style={{ width: `${ruta.match}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Recommendations */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-white">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg">Recomendaciones IA</CardTitle>
                        </div>
                        <CardDescription>Basadas en tu CV y objetivos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    tipo: "Habilidad requerida",
                                    titulo: "TypeScript",
                                    razon: "Demandada en el 85% de ofertas que te interesan",
                                    icon: "🎯",
                                    accion: "Agregar al CV"
                                },
                                {
                                    tipo: "Actualiza tu perfil",
                                    titulo: "Sube tu CV actualizado",
                                    razon: "Tu último CV tiene 2 meses de antigüedad",
                                    icon: "📄",
                                    accion: "Subir CV"
                                },
                                {
                                    tipo: "Oportunidad perfecta",
                                    titulo: "5 empleos nuevos - 90% match",
                                    razon: "Publicados en las últimas 24h",
                                    icon: "💼",
                                    accion: "Ver empleos"
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-white rounded-lg border border-primary/20 hover:border-primary hover:shadow-md transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <Badge variant="secondary" className="text-xs mb-2">
                                                {item.tipo}
                                            </Badge>
                                            <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                                {item.titulo}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                {item.razon}
                                            </p>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs px-3 w-full hover:bg-primary/10 hover:text-primary">
                                                {item.accion} →
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4 border-primary/30 hover:bg-primary/10">
                            Generar nueva ruta con IA
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Acciones Rápidas</CardTitle>
                    <CardDescription>Herramientas para potenciar tu búsqueda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Actualizar CV</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all group"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Mis Habilidades</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all group"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Buscar Empleos</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all group"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">Mi Progreso</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
