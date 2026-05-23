import { useEffect, useState } from 'react'
import { MessageSquare, Users, TrendingUp, Clock, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { ChatService } from '@/modules/chat/services/ChatService'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChatItem {
    id: number
    titulo: string
    persona_id: number
    created_at: string
}

export const AdminChatDashboard = () => {
    const [chats, setChats] = useState<ChatItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        ChatService.listar()
            .then((data: ChatItem[]) => setChats(data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const totalSesiones = chats.length
    const usuariosUnicos = new Set(chats.map(c => c.persona_id)).size
    const sesionesHoy = chats.filter(c => {
        const diff = (Date.now() - new Date(c.created_at).getTime()) / 86400000
        return diff < 1
    }).length

    const stats = [
        { label: 'Total sesiones', value: totalSesiones, icon: MessageSquare, color: 'bg-violet-100 text-violet-700' },
        { label: 'Usuarios con sesiones', value: usuariosUnicos, icon: Users, color: 'bg-blue-100 text-blue-700' },
        { label: 'Sesiones hoy', value: sesionesHoy, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
    ]

    if (loading) return (
        <div className="flex items-center justify-center h-80">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Cargando estadísticas del chatbot...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-violet-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Uso del Mentor IA</h1>
                    <p className="text-sm text-muted-foreground">Estadísticas de sesiones del chatbot</p>
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
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">Sesiones recientes</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {chats.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No hay sesiones de chat aún.</p>
                    ) : (
                        <div className="space-y-2">
                            {chats.slice(0, 30).map(c => (
                                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{c.titulo || 'Sesión sin título'}</p>
                                        <p className="text-xs text-muted-foreground">Persona #{c.persona_id}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">#{c.id}</Badge>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {chats.length > 30 && (
                                <p className="text-xs text-muted-foreground text-center pt-2">+{chats.length - 30} sesiones más</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
