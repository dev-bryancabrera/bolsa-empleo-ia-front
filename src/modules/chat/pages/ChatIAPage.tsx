import { useState, useEffect, useRef } from 'react';
import { ConversacionService } from '@/modules/chat/services/ConversacionService';
import type { ChatIAType, MensajeUI } from '@/modules/chat/types/ConversacionType';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Textarea } from '@/core/components/ui/textarea';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Badge } from '@/core/components/ui/badge';
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar';
import {
    MessageSquare,
    Send,
    Trash2,
    Plus,
    Bot,
    User,
    Loader2,
    ArrowDown,
    History,
    Moon,
    Sun
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserService } from '@/modules/users/services/UserService';
import { ChatService } from '../services/ChatService';

export const ChatIAPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
    const [historial, setHistorial] = useState<ChatIAType[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [inputMensaje, setInputMensaje] = useState('');
    const [rutaAprendizaje, setRutaAprendizaje] = useState<any>(null);
    const [chatActualId, setChatActualId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [historialAbierto, setHistorialAbierto] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    /* 1️⃣ Cargar datos del usuario (solo una vez) */
    useEffect(() => {
        fetchCVDataUsuario();
        inputRef.current?.focus();
    }, []);

    /* 2️⃣ Cuando userData ya existe → cargar historial */
    useEffect(() => {
        if (userData?.persona?.id) {
            cargarHistorial(userData.persona.id);
        }
    }, [userData]);

    /* 3️⃣ Obtener datos del usuario */
    const fetchCVDataUsuario = async () => {
        if (!authUser?.id) return;

        try {
            const data = await UserService.obtenerPersonaPorUsuario(authUser.id);
            setUserData(data);
        } catch (error) {
            console.error("Error cargando datos de persona en Dashboard: ", error);
        } finally {
            setLoading(false);
        }
    };

    /* 4️⃣ Scroll automático cuando llegan mensajes */
    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    /* 5️⃣ Cargar historial (recibe el ID) */
    const cargarHistorial = async (personaId: number) => {
        try {
            const data = await ChatService.obtenerPorPersona(personaId);
            setHistorial(data || []);
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    };

    /* 6️⃣ Función de scroll */
    const scrollToBottom = (smooth = true) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto',
            });
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        }
    };

    const handleEnviarMensaje = async () => {
        if (!inputMensaje.trim() || isLoading) return;

        let chatId = chatActualId;

        // 🔥 Si no hay chat activo, crear uno nuevo
        if (!chatActualId) {
            try {
                const nuevoChat = await ChatService.crear(
                    userData.persona.id,
                    inputMensaje.trim().substring(0, 50) // Título del chat
                );

                chatId = nuevoChat.id;
                setChatActualId(nuevoChat.id);
            } catch (error) {
                console.error('Error creando chat:', error);
                toast.error('Error al crear el chat');
                return;
            }
        }

        const mensajeUsuario: MensajeUI = {
            id: `temp-${Date.now()}`,
            tipo: 'usuario',
            contenido: inputMensaje.trim(),
            timestamp: new Date().toISOString(),
        };

        setMensajes([...mensajes, mensajeUsuario]);
        setInputMensaje('');
        setIsLoading(true);

        const mensajeTyping: MensajeUI = {
            id: `typing-${Date.now()}`,
            tipo: 'ia',
            contenido: '',
            timestamp: new Date().toISOString(),
            loading: true,
        };
        setMensajes(prev => [...prev, mensajeTyping]);

        try {
            // ✅ Enviar con chat_id
            const respuesta = await ConversacionService.enviarMensaje(
                chatId!,
                userData.persona.id,
                inputMensaje.trim()
            );

            let contenidoRespuesta = respuesta.respuesta;
            let esRutaAprendizaje = false;

            try {
                const jsonMatch = contenidoRespuesta.match(/\{[\s\S]*"tipo"\s*:\s*"ruta_aprendizaje"[\s\S]*\}/);
                if (jsonMatch) {
                    const rutaData = JSON.parse(jsonMatch[0]);
                    setRutaAprendizaje(rutaData);
                    esRutaAprendizaje = true;
                    contenidoRespuesta = "✅ He generado tu ruta de aprendizaje personalizada.";
                }
            } catch (e) { }

            setMensajes(prev => {
                const sinTyping = prev.filter(m => !m.loading);
                return [
                    ...sinTyping,
                    {
                        id: respuesta.id || `ia-${Date.now()}`,
                        tipo: 'ia',
                        contenido: contenidoRespuesta,
                        timestamp: respuesta.created_at || new Date().toISOString(),
                        esRutaAprendizaje
                    }
                ];
            });

            await cargarHistorial(userData.persona.id);
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            toast.error('Error al enviar el mensaje');
            setMensajes(prev => prev.filter(m => !m.loading));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviarMensaje();
        }
    };

    const handleNuevaConversacion = () => {
        setMensajes([]);
        setInputMensaje('');
        setChatActualId(null); // ✅ Resetear chat actual
        inputRef.current?.focus();
        toast.success('Nueva conversación iniciada');
    };

    const handleEliminarChat = async (id: number) => {
        try {
            await ChatService.eliminar(id);
            toast.success('Conversación eliminada');
            await cargarHistorial(userData.persona.id);
        } catch (error) {
            console.error('Error eliminando chat:', error);
            toast.error('Error al eliminar la conversación');
        }
    };

    const handleCargarConversacion = async (chat: ChatIAType) => {
        try {
            // ✅ Cargar todas las conversaciones del chat
            const conversaciones = await ConversacionService.listarConversacionesPorChat(chat.id);

            // ✅ Mapear conversaciones según respuesta_chat
            const mensajesConversacion: MensajeUI[] = [];

            conversaciones.forEach((conv: any) => {
                if (conv.respuesta_chat === 0) {
                    // Mensaje del usuario
                    mensajesConversacion.push({
                        id: `${conv.id}-user`,
                        tipo: 'usuario',
                        contenido: conv.mensaje,
                        timestamp: conv.created_at,
                    });
                } else if (conv.respuesta_chat === 1) {
                    // Respuesta de la IA
                    let contenidoRespuesta = conv.respuesta;

                    // ✅ Si es JSON (json === 1), extraer y setear ruta de aprendizaje
                    if (conv.json === 1) {
                        try {
                            const jsonMatch = contenidoRespuesta.match(/\{[\s\S]*"tipo"\s*:\s*"ruta_aprendizaje"[\s\S]*\}/);
                            if (jsonMatch) {
                                const rutaData = JSON.parse(jsonMatch[0]);
                                setRutaAprendizaje(rutaData); // ✅ Mostrar en panel lateral
                                contenidoRespuesta = "✅ He generado tu ruta de aprendizaje personalizada.";
                            }
                        } catch (e) {
                            console.error('Error parseando JSON de ruta:', e);
                        }
                    }

                    mensajesConversacion.push({
                        id: `${conv.id}-ia`,
                        tipo: 'ia',
                        contenido: contenidoRespuesta,
                        timestamp: conv.created_at,
                    });
                }
            });

            setMensajes(mensajesConversacion);
            setChatActualId(chat.id); // ✅ Establecer el chat actual
        } catch (error) {
            console.error('Error cargando conversación:', error);
            toast.error('Error al cargar la conversación');
        }
    };

    const agruparPorFecha = (chats: ChatIAType[]) => {
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        const grupos: Record<string, ChatIAType[]> = {
            'Hoy': [],
            'Ayer': [],
            'Esta semana': [],
            'Más antiguo': []
        };

        chats.forEach(chat => {
            const fecha = new Date(chat.created_at);
            const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDias === 0) {
                grupos['Hoy'].push(chat);
            } else if (diffDias === 1) {
                grupos['Ayer'].push(chat);
            } else if (diffDias <= 7) {
                grupos['Esta semana'].push(chat);
            } else {
                grupos['Más antiguo'].push(chat);
            }
        });

        return grupos;
    };

    const gruposHistorial = agruparPorFecha(historial);

    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* Panel Izquierdo - Historial */}
            <div
                className={`${historialAbierto ? 'w-80' : 'w-0'
                    } transition-all duration-300 border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    } flex flex-col`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <Button
                        onClick={handleNuevaConversacion}
                        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Conversación
                    </Button>
                </div>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        {Object.entries(gruposHistorial).map(([grupo, chats]) => (
                            chats.length > 0 && (
                                <div key={grupo} className="mb-6">
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                                        {grupo}
                                    </h3>
                                    <div className="space-y-2">
                                        {chats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className="cursor-pointer hover:shadow-md transition-all group border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-3"
                                                onClick={() => handleCargarConversacion(chat)}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <MessageSquare className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDistanceToNow(new Date(chat.created_at), {
                                                                    addSuffix: true,
                                                                    locale: es
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {/* {chat.mensaje.substring(0, 50)}... */}
                                                            {chat.titulo || 'Chat sin título'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEliminarChat(chat.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}

                        {historial.length === 0 && (
                            <div className="text-center py-12">
                                <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No hay conversaciones aún</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Panel Central - Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 flex-shrink-0`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setHistorialAbierto(!historialAbierto)}
                            >
                                <History className="w-5 h-5" />
                            </Button>

                            <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                                <AvatarFallback className="bg-transparent">
                                    <Bot className="h-6 w-6 text-white" />
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white">
                                    Asistente de Empleo IA
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">En línea</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {mensajes.length > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {mensajes.length} mensajes
                                </Badge>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDarkMode(!darkMode)}
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Área de Mensajes */}
                <div className="flex-1 overflow-y-auto relative">
                    <ScrollArea
                        className="h-full p-6"
                        ref={scrollRef}
                        onScroll={handleScroll}
                    >
                        {mensajes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                                    <Bot className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    ¡Hola! Soy tu Asistente de Empleo
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                                    Puedo ayudarte con búsqueda de empleos, mejorar tu CV, prepararte para entrevistas y mucho más.
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-w-2xl">
                                    {[
                                        '¿Cómo mejorar mi CV?',
                                        'Buscar empleos en tecnología',
                                        'Preparar entrevista',
                                        'Consejos de carrera'
                                    ].map((sugerencia) => (
                                        <Button
                                            key={sugerencia}
                                            variant="outline"
                                            className="text-left justify-start"
                                            onClick={() => setInputMensaje(sugerencia)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            {sugerencia}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {mensajes.map((mensaje) => (
                                    <MensajeBurbuja
                                        key={mensaje.id}
                                        mensaje={mensaje}
                                        darkMode={darkMode}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Botón Scroll to Bottom */}
                    {showScrollButton && (
                        <div className="absolute bottom-4 right-8">
                            <Button
                                size="sm"
                                className="rounded-full shadow-lg"
                                onClick={() => scrollToBottom()}
                            >
                                <ArrowDown className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 flex-shrink-0`}>
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <Textarea
                            ref={inputRef}
                            value={inputMensaje}
                            onChange={(e) => setInputMensaje(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Pregúntame sobre empleos, CV, entrevistas..."
                            className="min-h-[60px] max-h-[200px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleEnviarMensaje}
                            disabled={!inputMensaje.trim() || isLoading}
                            className="h-[60px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                        Presiona Enter para enviar, Shift + Enter para nueva línea
                    </p>
                </div>
            </div>

            {/* 🔥 Panel Derecho - Ruta de Aprendizaje */}
            {rutaAprendizaje && (
                <div className={`w-96 border-l ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex flex-col`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                        <h3 className="font-bold text-lg">📚 Ruta de Aprendizaje</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRutaAprendizaje(null)}
                        >
                            ✕
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <RutaAprendizajePanel ruta={rutaAprendizaje} darkMode={darkMode} />
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};

// Componente auxiliar para cada mensaje
const MensajeBurbuja = ({ mensaje, darkMode }: { mensaje: MensajeUI; darkMode: boolean }) => {
    const esUsuario = mensaje.tipo === 'usuario';

    return (
        <div className={`flex gap-3 ${esUsuario ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}>
            <Avatar className={`h-8 w-8 flex-shrink-0 ${esUsuario ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                <AvatarFallback className="bg-transparent">
                    {esUsuario ? (
                        <User className="h-5 w-5 text-white" />
                    ) : (
                        <Bot className="h-5 w-5 text-white" />
                    )}
                </AvatarFallback>
            </Avatar>

            <div className={`flex flex-col ${esUsuario ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div
                    className={`rounded-2xl px-4 py-3 ${esUsuario
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : darkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-white border-2 border-gray-200 text-gray-900 shadow-sm'
                        }`}
                >
                    {mensaje.loading ? (
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
                    )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(mensaje.timestamp), {
                        addSuffix: true,
                        locale: es
                    })}
                </span>
            </div>
        </div>
    );
};

const RutaAprendizajePanel = ({ ruta, darkMode }: { ruta: any; darkMode: boolean }) => {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-xl mb-2">{ruta.titulo}</h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>⏱️ {ruta.duracion_total}</span>
                    <span>📅 {ruta.horas_semanales}h/semana</span>
                </div>
            </div>

            {ruta.fases?.map((fase: any, idx: number) => (
                <Card key={idx}>
                    <CardHeader>
                        <CardTitle className="text-lg">{fase.nombre}</CardTitle>
                        <p className="text-sm text-gray-500">{fase.duracion}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fase.modulos?.map((modulo: any, mIdx: number) => (
                            <div key={mIdx} className="border-l-4 border-blue-500 pl-4">
                                <h5 className="font-semibold">{modulo.tecnologia}</h5>
                                <p className="text-sm text-gray-600">
                                    {modulo.nivel_actual} → {modulo.nivel_objetivo}
                                </p>
                                <ul className="mt-2 text-sm space-y-1">
                                    {modulo.temas?.map((tema: string, tIdx: number) => (
                                        <li key={tIdx}>• {tema}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {ruta.proyectos && (
                <Card>
                    <CardHeader>
                        <CardTitle>🎯 Proyectos Prácticos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ruta.proyectos.map((proyecto: any, idx: number) => (
                            <div key={idx} className="mb-4">
                                <h5 className="font-semibold">{proyecto.nombre}</h5>
                                <p className="text-sm">{proyecto.descripcion}</p>
                                <div className="flex gap-2 mt-2">
                                    {proyecto.tecnologias?.map((tech: string) => (
                                        <Badge key={tech} variant="secondary">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};