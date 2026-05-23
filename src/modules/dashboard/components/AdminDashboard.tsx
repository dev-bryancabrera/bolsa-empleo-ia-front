import { useEffect, useState } from 'react'
import { Users, FileText, ShieldCheck, UserCheck, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { UserService } from '@/modules/users/services/UserService'
import { CVService } from '@/modules/cv/services/CVService'

interface UsuarioItem {
    id: number
    email: string
    rol: string
    activo: boolean
    id_persona?: number | null
    proveedor?: string
    createdAt?: string
    persona?: { nombre?: string; apellido?: string }
}

export const AdminDashboard = () => {
    const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
    const [totalCVs, setTotalCVs] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            try {
                const [users, cvs] = await Promise.allSettled([
                    UserService.listarUsuarios(),
                    CVService.listarCVs(),
                ])
                if (users.status === 'fulfilled') setUsuarios(users.value ?? [])
                if (cvs.status === 'fulfilled') setTotalCVs((cvs.value ?? []).length)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    const totalUsuarios = usuarios.length
    const usuariosActivos = usuarios.filter(u => u.activo).length
    const usuariosAdmin = usuarios.filter(u => u.rol === 'admin').length
    const usuariosConCV = usuarios.filter(u => u.id_persona != null).length

    const stats = [
        {
            label: 'Usuarios totales',
            value: totalUsuarios,
            icon: Users,
            color: 'bg-blue-100 text-blue-700',
            sub: `${usuariosActivos} activos`,
        },
        {
            label: 'CVs registrados',
            value: totalCVs ?? '—',
            icon: FileText,
            color: 'bg-green-100 text-green-700',
            sub: `${usuariosConCV} usuarios con perfil`,
        },
        {
            label: 'Administradores',
            value: usuariosAdmin,
            icon: ShieldCheck,
            color: 'bg-violet-100 text-violet-700',
            sub: 'con acceso total',
        },
        {
            label: 'Usuarios regulares',
            value: totalUsuarios - usuariosAdmin,
            icon: UserCheck,
            color: 'bg-amber-100 text-amber-700',
            sub: 'profesionales registrados',
        },
    ]

    if (loading) return (
        <div className="flex items-center justify-center h-80">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Cargando panel de administración...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
                    <p className="text-sm text-muted-foreground">Estado general de la plataforma</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <Card key={i} className="border-border">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabla de usuarios */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">Usuarios registrados</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {usuarios.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No hay usuarios registrados aún.</p>
                    ) : (
                        <div className="space-y-2">
                            {usuarios.slice(0, 20).map(u => {
                                const nombre = u.persona?.nombre
                                    ? `${u.persona.nombre} ${u.persona.apellido ?? ''}`.trim()
                                    : null
                                return (
                                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {nombre ?? u.email}
                                            </p>
                                            {nombre && (
                                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            {u.proveedor === 'google' && (
                                                <span className="text-xs text-muted-foreground">Google</span>
                                            )}
                                            <Badge
                                                className={
                                                    u.rol === 'admin'
                                                        ? 'bg-violet-100 text-violet-700 border-0 text-xs'
                                                        : 'bg-blue-100 text-blue-700 border-0 text-xs'
                                                }
                                            >
                                                {u.rol}
                                            </Badge>
                                            <Badge
                                                className={
                                                    u.activo
                                                        ? 'bg-green-100 text-green-700 border-0 text-xs'
                                                        : 'bg-red-100 text-red-700 border-0 text-xs'
                                                }
                                            >
                                                {u.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                    </div>
                                )
                            })}
                            {usuarios.length > 20 && (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    +{usuarios.length - 20} usuarios más
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
