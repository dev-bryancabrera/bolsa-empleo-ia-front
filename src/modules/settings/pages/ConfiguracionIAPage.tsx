import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { cn } from '@/lib/utils'
import { ConfiguracionIAService } from '@/modules/settings/services/ConfiguracionIAService'
import type { ConfiguracionIA, ProveedorIA, ModeloIA, ProveedorInfo } from '@/modules/settings/types/ConfiguracionIATypes'
import { useAuthStore } from '@/modules/auth/services/AuthService'
import { UserService } from '@/modules/users/services/UserService'
import { Cpu, Key, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ChevronRight, Sparkles, Zap, Settings2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const PROVEEDOR_ICONS: Record<ProveedorIA, string> = {
    groq: '⚡',
    openai: '🤖',
    anthropic: '🧠'
}

const PROVEEDOR_COLORS: Record<ProveedorIA, string> = {
    groq: 'from-orange-500 to-amber-500',
    openai: 'from-emerald-500 to-teal-600',
    anthropic: 'from-violet-500 to-purple-600'
}

export const ConfiguracionIAPage = () => {
    const authUser = useAuthStore(state => state.user)
    const navigate = useNavigate()
    const [personaId, setPersonaId] = useState<number | null>(null)
    const [config, setConfig] = useState<ConfiguracionIA | null>(null)
    const [selectedProveedor, setSelectedProveedor] = useState<ProveedorIA>('groq')
    const [selectedModelo, setSelectedModelo] = useState<string>('llama-3.3-70b-versatile')
    const [apiKey, setApiKey] = useState('')
    const [showKey, setShowKey] = useState(false)
    const [modelosDisponibles, setModelosDisponibles] = useState<ModeloIA[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [validando, setValidando] = useState(false)
    const [keyValida, setKeyValida] = useState<boolean | null>(null)

    useEffect(() => {
        if (authUser?.id) cargarDatos()
    }, [authUser])

    const cargarDatos = async () => {
        try {
            const userData = await UserService.obtenerPersonaPorUsuario(authUser!.id)
            const pid = userData.id_persona
            if (!pid) {
                setLoading(false)
                return
            }
            setPersonaId(pid)
            const cfg = await ConfiguracionIAService.obtener(pid)
            setConfig(cfg)
            setSelectedProveedor(cfg.proveedor)
            setSelectedModelo(cfg.modelo)
            setModelosDisponibles(cfg.modelos)
        } catch (e) {
            console.error('Error cargando configuración IA:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleCambiarProveedor = async (proveedor: ProveedorIA) => {
        setSelectedProveedor(proveedor)
        setApiKey('')
        setKeyValida(null)
        try {
            const data = await ConfiguracionIAService.obtenerModelos(proveedor)
            setModelosDisponibles(data.modelos || [])
            if (data.modelos?.length > 0) setSelectedModelo(data.modelos[0].id)
        } catch (_) {}
    }

    const handleValidarKey = async () => {
        if (!apiKey.trim()) return
        setValidando(true)
        setKeyValida(null)
        try {
            await ConfiguracionIAService.guardar(personaId!, selectedProveedor, selectedModelo, apiKey)
            setKeyValida(true)
            toast.success('API key validada y configuración guardada')
        } catch (e: any) {
            setKeyValida(false)
            toast.error(e?.response?.data?.message || 'API key inválida')
        } finally {
            setValidando(false)
        }
    }

    const handleGuardar = async () => {
        if (!personaId) return
        if (selectedProveedor !== 'groq' && !apiKey && !config?.tiene_api_key) {
            toast.error('Ingresa tu API key para continuar')
            return
        }
        setGuardando(true)
        try {
            await ConfiguracionIAService.guardar(
                personaId,
                selectedProveedor,
                selectedModelo,
                selectedProveedor !== 'groq' ? apiKey || undefined : undefined
            )
            toast.success('Configuración de IA guardada correctamente')
            await cargarDatos()
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Error al guardar la configuración')
        } finally {
            setGuardando(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!personaId) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Settings2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Configura tu IA</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        Para personalizar la configuración de IA necesitas tener tu CV registrado primero.
                    </p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/dashboard/cv')}
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2 shadow-lg"
                        >
                            <Sparkles className="w-4 h-4" />
                            Crear mi CV primero
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                            Volver al dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const proveedores: ProveedorInfo[] = config?.proveedores || []
    const esGratuito = selectedProveedor === 'groq'
    const necesitaKey = !esGratuito && !config?.tiene_api_key

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 p-6 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Cpu className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Configuración de IA</h1>
                        <p className="text-white/80 text-sm mt-0.5">
                            Elige el proveedor y modelo que usará el sistema para analizar tu perfil
                        </p>
                    </div>
                    {config && (
                        <div className="ml-auto flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                            <span className="text-lg">{PROVEEDOR_ICONS[config.proveedor]}</span>
                            <span className="text-white text-xs font-semibold">{config.modelo}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Selección de proveedor */}
            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        1. Elige tu proveedor de IA
                    </CardTitle>
                    <CardDescription>Groq es gratuito. OpenAI y Anthropic requieren tu propia API key.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {proveedores.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handleCambiarProveedor(p.id as ProveedorIA)}
                            className={cn(
                                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                                selectedProveedor === p.id
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                            )}
                        >
                            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-2xl shadow-lg', PROVEEDOR_COLORS[p.id as ProveedorIA])}>
                                {PROVEEDOR_ICONS[p.id as ProveedorIA]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">{p.nombre}</span>
                                    {p.gratuito && (
                                        <Badge className="bg-green-500 text-white border-0 text-xs">Gratuito</Badge>
                                    )}
                                    {!p.gratuito && (
                                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">De pago</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{p.descripcion}</p>
                            </div>
                            {selectedProveedor === p.id && (
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            )}
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Selección de modelo */}
            {modelosDisponibles.length > 0 && (
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            2. Elige el modelo
                        </CardTitle>
                        <CardDescription>Modelos más grandes ofrecen mejor calidad pero pueden ser más lentos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {modelosDisponibles.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedModelo(m.id)}
                                className={cn(
                                    'w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left',
                                    selectedModelo === m.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn('w-2 h-2 rounded-full', selectedModelo === m.id ? 'bg-primary' : 'bg-muted-foreground/30')} />
                                    <div>
                                        <span className="font-semibold text-sm text-foreground">{m.nombre}</span>
                                        <p className="text-xs text-muted-foreground font-mono">{m.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {m.gratuito
                                        ? <Badge className="bg-green-500 text-white border-0 text-xs">Gratis</Badge>
                                        : <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">De pago</Badge>
                                    }
                                    {selectedModelo === m.id && <ChevronRight className="w-4 h-4 text-primary" />}
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* API Key (solo para proveedores de pago) */}
            {!esGratuito && (
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-primary" />
                            3. Tu API Key de {selectedProveedor === 'openai' ? 'OpenAI' : 'Anthropic'}
                        </CardTitle>
                        <CardDescription>
                            {config?.tiene_api_key
                                ? 'Ya tienes una API key guardada. Ingresa una nueva para reemplazarla.'
                                : `Obtén tu API key en ${selectedProveedor === 'openai' ? 'platform.openai.com' : 'console.anthropic.com'}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {config?.tiene_api_key && !apiKey && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200">
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                <p className="text-sm text-green-700 dark:text-green-400">API key configurada — el sistema usará la guardada</p>
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={e => { setApiKey(e.target.value); setKeyValida(null); }}
                                placeholder={
                                    selectedProveedor === 'openai'
                                        ? 'sk-...'
                                        : 'sk-ant-...'
                                }
                                className={cn(
                                    'w-full pr-24 pl-4 py-3 rounded-xl border-2 bg-background text-foreground font-mono text-sm transition-colors outline-none',
                                    keyValida === true && 'border-green-500',
                                    keyValida === false && 'border-red-500',
                                    keyValida === null && 'border-border focus:border-primary'
                                )}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                {apiKey && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleValidarKey}
                                        disabled={validando}
                                        className="h-7 text-xs px-2"
                                    >
                                        {validando ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Validar'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {keyValida === true && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <p className="text-sm text-green-700 dark:text-green-400 font-medium">API key válida y guardada correctamente</p>
                            </div>
                        )}
                        {keyValida === false && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <p className="text-sm text-red-700 dark:text-red-400">API key inválida. Verifica que sea correcta y tenga créditos disponibles.</p>
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Tu API key se almacena de forma segura y solo se usa para las llamadas de IA de tu cuenta.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Botón guardar (para Groq o si ya tiene key) */}
            {(esGratuito || config?.tiene_api_key) && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2 px-6"
                    >
                        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {guardando ? 'Guardando...' : 'Guardar configuración'}
                    </Button>
                </div>
            )}
        </div>
    )
}
