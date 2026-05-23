import { useEffect, useState } from 'react'
import { Users, ShieldCheck, UserCheck, Search, ToggleLeft, ToggleRight, Loader2, Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { UserService } from '@/modules/users/services/UserService'
import { MODULOS_DISPONIBLES } from '@/modules/dashboard/types'
import { toast } from 'react-toastify'

interface UsuarioItem {
    id: number
    email: string
    rol: string
    activo: boolean
    id_persona?: number | null
    proveedor?: string
    modulos_permitidos?: string | null
    persona?: { nombre?: string; apellido?: string }
}

function parseModulos(raw: string | null | undefined): string[] | null {
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
}

export const AdminUsersPage = () => {
    const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState<number | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [expandedId, setExpandedId] = useState<number | null>(null)

    useEffect(() => { cargar() }, [])

    const cargar = async () => {
        try {
            const data = await UserService.listarUsuarios()
            setUsuarios(data ?? [])
        } catch {
            toast.error('Error al cargar usuarios')
        } finally {
            setLoading(false)
        }
    }

    const toggleActivo = async (u: UsuarioItem) => {
        setToggling(u.id)
        try {
            await UserService.actualizarUsuario(u.id, { activo: !u.activo })
            setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !u.activo } : x))
            toast.success(`Usuario ${!u.activo ? 'activado' : 'desactivado'} correctamente`)
        } catch {
            toast.error('Error al actualizar el usuario')
        } finally {
            setToggling(null)
        }
    }

    const toggleModulo = async (u: UsuarioItem, slug: string) => {
        const current = parseModulos(u.modulos_permitidos)
        // null means all allowed → first toggle restricts to all-except-toggled
        const base = current ?? MODULOS_DISPONIBLES.map(m => m.slug)
        const next = base.includes(slug as never)
            ? base.filter(s => s !== slug)
            : [...base, slug]

        // If all modules enabled, store null (unrestricted)
        const allSlugs = MODULOS_DISPONIBLES.map(m => m.slug as string)
        const newValue = allSlugs.every(s => next.includes(s)) ? null : next

        try {
            await UserService.actualizarUsuario(u.id, {
                modulos_permitidos: newValue as any
            })
            setUsuarios(prev => prev.map(x =>
                x.id === u.id
                    ? { ...x, modulos_permitidos: newValue ? JSON.stringify(newValue) : null }
                    : x
            ))
        } catch {
            toast.error('Error al actualizar permisos')
        }
    }

    const filtrados = usuarios.filter(u => {
        if (u.rol === 'admin') return false // don't show admins in the list
        const q = busqueda.toLowerCase()
        if (!q) return true
        const nombre = u.persona?.nombre ? `${u.persona.nombre} ${u.persona.apellido ?? ''}`.toLowerCase() : ''
        return nombre.includes(q) || u.email.toLowerCase().includes(q)
    })

    const totalUsuarios = usuarios.filter(u => u.rol !== 'admin').length
    const activos = usuarios.filter(u => u.activo && u.rol !== 'admin').length
    const admins = usuarios.filter(u => u.rol === 'admin').length

    const stats = [
        { label: 'Usuarios regulares', value: totalUsuarios, icon: Users, color: 'bg-blue-100 text-blue-700' },
        { label: 'Activos', value: activos, icon: UserCheck, color: 'bg-green-100 text-green-700' },
        { label: 'Administradores', value: admins, icon: ShieldCheck, color: 'bg-violet-100 text-violet-700' },
    ]

    if (loading) return (
        <div className="flex items-center justify-center h-80">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
                    <p className="text-sm text-muted-foreground">Administra acceso, estado y módulos por usuario</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <CardTitle className="text-base">Usuarios del sistema</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {filtrados.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No se encontraron usuarios.</p>
                    ) : (
                        <div className="space-y-1">
                            {filtrados.map(u => {
                                const nombre = u.persona?.nombre
                                    ? `${u.persona.nombre} ${u.persona.apellido ?? ''}`.trim()
                                    : null
                                const isToggling = toggling === u.id
                                const expanded = expandedId === u.id
                                const modulos = parseModulos(u.modulos_permitidos)
                                const tieneRestricciones = modulos !== null

                                return (
                                    <div key={u.id} className="border-b border-border last:border-0">
                                        {/* Main row */}
                                        <div className="flex items-center justify-between py-3 gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {nombre ?? u.email}
                                                </p>
                                                {nombre && (
                                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {u.proveedor === 'google' && (
                                                    <span className="text-xs text-muted-foreground hidden sm:inline">Google</span>
                                                )}
                                                {tieneRestricciones && (
                                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs hidden sm:inline-flex">
                                                        {modulos!.length} módulos
                                                    </Badge>
                                                )}
                                                <Badge className={
                                                    u.activo
                                                        ? 'bg-green-100 text-green-700 border-0 text-xs'
                                                        : 'bg-red-100 text-red-700 border-0 text-xs'
                                                }>
                                                    {u.activo ? 'Activo' : 'Inactivo'}
                                                </Badge>

                                                {/* Toggle activo */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 gap-1 text-xs"
                                                    onClick={() => toggleActivo(u)}
                                                    disabled={isToggling}
                                                    title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                                >
                                                    {isToggling ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : u.activo ? (
                                                        <ToggleRight className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </Button>

                                                {/* Expand modules */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-xs text-muted-foreground"
                                                    onClick={() => setExpandedId(expanded ? null : u.id)}
                                                    title="Gestionar módulos"
                                                >
                                                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Module permissions panel */}
                                        {expanded && (
                                            <div className="pb-3 px-1">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                                    Módulos habilitados
                                                    {!tieneRestricciones && (
                                                        <span className="ml-2 text-green-600 normal-case font-normal">— todos activos</span>
                                                    )}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {MODULOS_DISPONIBLES.map(m => {
                                                        const habilitado = modulos === null || modulos.includes(m.slug)
                                                        return (
                                                            <button
                                                                key={m.slug}
                                                                onClick={() => toggleModulo(u, m.slug)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                                    habilitado
                                                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                                                        : 'bg-muted border-border text-muted-foreground line-through'
                                                                }`}
                                                            >
                                                                {m.label}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Haz clic en un módulo para activarlo o desactivarlo para este usuario.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
