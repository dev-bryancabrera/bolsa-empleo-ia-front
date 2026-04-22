import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ConversacionService } from '@/modules/chat/services/ConversacionService';
import { RutaService } from '@/modules/chat/services/RutaService';
import type { ChatIAType, MensajeUI } from '@/modules/chat/types/ConversacionType';
import type { RutaGuardada, RutaAprendizajeData } from '@/modules/chat/types/RutaType';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Textarea } from '@/core/components/ui/textarea';
import { ScrollArea } from '@/core/components/ui/scroll-area';
import { Badge } from '@/core/components/ui/badge';
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar';
import {
    Send, Trash2, Plus, User, Loader2, ArrowDown,
    History, Brain, Target, BookOpen, Sparkles, CheckCircle2,
    Circle, Briefcase, GraduationCap, TrendingUp, Clock,
    X, Lightbulb, Award, ChevronRight, MessageSquare, BarChart3,
    Mic, BookMarked, Layers, Download,
    ChevronDown, ChevronUp, Map, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserService } from '@/modules/users/services/UserService';
import { ChatService } from '../services/ChatService';
import { cn } from '@/lib/utils';

// ─── types ────────────────────────────────────────────────────────────────────
interface FaseProgress {
    [key: string]: boolean;
}

type SidebarTab = 'historial' | 'rutas';
type ModoChat = null | 'entrevista' | 'explorar_fase' | 'recursos';

// ─── helpers ──────────────────────────────────────────────────────────────────
const PHASE_COLORS = [
    { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-300 dark:border-violet-700', dot: 'bg-violet-500' },
    { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-300 dark:border-blue-700',     dot: 'bg-blue-500'   },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-700', dot: 'bg-indigo-500' },
    { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-400',       border: 'border-sky-300 dark:border-sky-700',       dot: 'bg-sky-500'    },
    { bg: 'bg-teal-100 dark:bg-teal-900/30',     text: 'text-teal-700 dark:text-teal-400',     border: 'border-teal-300 dark:border-teal-700',     dot: 'bg-teal-500'   },
];

function getPhaseColor(idx: number) { return PHASE_COLORS[idx % PHASE_COLORS.length]; }

function addMonthsToNow(months: number) {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
const MessageContent = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    return (
        <div className="text-sm space-y-0.5 leading-relaxed">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />;
                if (/^[-•*]\s/.test(line)) {
                    const text = line.replace(/^[-•*]\s/, '');
                    return (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                            <span>{renderInline(text)}</span>
                        </div>
                    );
                }
                if (/^\d+\.\s/.test(line)) {
                    const num = line.match(/^(\d+)\./)?.[1];
                    const text = line.replace(/^\d+\.\s/, '');
                    return (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="mt-0.5 font-semibold opacity-70 flex-shrink-0 text-xs">{num}.</span>
                            <span>{renderInline(text)}</span>
                        </div>
                    );
                }
                if (line.startsWith('### ')) return <p key={i} className="font-bold text-sm mt-2">{renderInline(line.slice(4))}</p>;
                if (line.startsWith('## '))  return <p key={i} className="font-bold text-base mt-2">{renderInline(line.slice(3))}</p>;
                if (line.startsWith('# '))   return <p key={i} className="font-bold text-lg mt-2">{renderInline(line.slice(2))}</p>;
                return <p key={i}>{renderInline(line)}</p>;
            })}
        </div>
    );
};

function renderInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
                if (part.startsWith('*')  && part.endsWith('*'))  return <em key={i}>{part.slice(1, -1)}</em>;
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

// ─── Modo badge ───────────────────────────────────────────────────────────────
const MODO_CONFIG: Record<NonNullable<ModoChat>, { label: string; color: string; icon: React.ReactNode }> = {
    entrevista: {
        label: 'Simulacro de entrevista',
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
        icon: <Mic className="w-3 h-3" />,
    },
    explorar_fase: {
        label: 'Explorar fase',
        color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-700',
        icon: <Layers className="w-3 h-3" />,
    },
    recursos: {
        label: 'Curación de recursos',
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
        icon: <BookMarked className="w-3 h-3" />,
    },
};

// ─── Print function ───────────────────────────────────────────────────────────
function printRuta(ruta: RutaAprendizajeData, userName: string, rutaGuardada?: RutaGuardada | null) {
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    let progreso: Record<string, boolean> = {};
    if (rutaGuardada?.progreso_fases) {
        try { progreso = JSON.parse(rutaGuardada.progreso_fases); } catch (_) {}
    }
    const totalFases = ruta.fases?.length || 0;
    const fasesCompletadas = Object.values(progreso).filter(Boolean).length;
    const pct = totalFases > 0 ? Math.round((fasesCompletadas / totalFases) * 100) : 0;

    const phaseHeaderColors = ['#7c3aed', '#2563eb', '#0284c7', '#0891b2', '#059669', '#d97706', '#dc2626'];

    const fasesHTML = (ruta.fases || []).map((fase, idx) => {
        const hColor = phaseHeaderColors[idx % phaseHeaderColors.length];
        const key = `${ruta.objetivo_profesional}-fase-${idx}`;
        const isDone = progreso[key] === true;
        const recursos = (fase as any).recursos_clave as string[] | undefined;
        const checklist = (fase as any).checklist_dominio as string[] | undefined;
        const dificultad = (fase as any).nivel_dificultad as string | undefined;

        return `
        <div style="margin:0 0 20px;border:2px solid ${hColor};border-radius:14px;overflow:hidden;page-break-inside:avoid;">
            <div style="background:${hColor};color:#fff;padding:14px 18px;display:flex;align-items:center;gap:14px;">
                <div style="min-width:72px;background:rgba(255,255,255,0.25);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:800;text-align:center;">Fase ${fase.fase}</div>
                <div style="flex:1;">
                    <div style="font-size:15px;font-weight:800;line-height:1.2;">${fase.nombre}</div>
                    <div style="font-size:10px;opacity:0.9;margin-top:3px;">⏱ ${fase.duracion_meses} mes(es)${dificultad ? ` &nbsp;·&nbsp; Nivel: ${dificultad}` : ''}</div>
                </div>
                <div style="background:rgba(255,255,255,0.25);border-radius:12px;padding:4px 12px;font-size:11px;font-weight:700;">${isDone ? '✅ Completada' : '⬜ Pendiente'}</div>
            </div>
            <div style="background:#fff;padding:16px 18px;">
                ${fase.objetivo ? `<p style="font-size:11px;color:#555;font-style:italic;margin-bottom:12px;">${fase.objetivo}</p>` : ''}
                ${fase.competencias_a_desarrollar?.length ? `
                <div style="margin-bottom:10px;">
                    <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;">🧠 Competencias a Desarrollar</div>
                    <div>${fase.competencias_a_desarrollar.map(c => `<span style="display:inline-block;background:#ede9fe;color:#5b21b6;border:1px solid #c4b5fd;border-radius:12px;padding:3px 10px;font-size:10px;font-weight:500;margin:2px;">${c}</span>`).join('')}</div>
                </div>` : ''}
                ${fase.acciones_recomendadas?.length ? `
                <div style="margin-bottom:10px;">
                    <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;">📋 Acciones Recomendadas</div>
                    <ul style="list-style:none;padding:0;">${fase.acciones_recomendadas.map(a => `<li style="font-size:10.5px;color:#333;padding:3px 0 3px 16px;position:relative;"><span style="position:absolute;left:0;color:${hColor};font-weight:700;">→</span>${a}</li>`).join('')}</ul>
                </div>` : ''}
                ${recursos?.length ? `
                <div style="margin-bottom:10px;">
                    <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;">📚 Recursos Clave</div>
                    <ul style="list-style:none;padding:0;">${recursos.map(r => `<li style="font-size:10.5px;color:#333;padding:3px 0 3px 16px;position:relative;"><span style="position:absolute;left:0;color:#2563eb;font-weight:700;">📖</span>${r}</li>`).join('')}</ul>
                </div>` : ''}
                ${checklist?.length ? `
                <div style="margin-bottom:10px;">
                    <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;">✅ Checklist de Dominio</div>
                    ${checklist.map(item => `<div style="display:flex;align-items:center;gap:8px;font-size:10.5px;color:#333;padding:2px 0;"><div style="width:14px;height:14px;border:2px solid #d1d5db;border-radius:3px;flex-shrink:0;"></div><span>${item}</span></div>`).join('')}
                </div>` : ''}
                ${fase.resultado_esperado ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;margin-top:10px;"><div style="font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:4px;">🏆 Resultado Esperado</div><p style="font-size:10.5px;color:#166534;">${fase.resultado_esperado}</p></div>` : ''}
            </div>
        </div>`;
    }).join('');

    const nextSteps = (ruta as any).proximos_pasos_inmediatos as string[] | undefined;
    const puntuacion = ruta.perfil_actual?.puntuacion_empleabilidad;

    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Ruta de Aprendizaje — ${ruta.titulo}</title>
<style>
@page { margin: 18mm 14mm; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; font-size: 11pt; line-height: 1.55; background: #fff; }
</style></head><body>

<!-- CABECERA MEMBRETADA -->
<div style="background:linear-gradient(135deg,#5445cf 0%,#333697 55%,#7c3aed 100%);color:#fff;padding:22px 28px 20px;border-radius:0 0 20px 20px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:46px;height:46px;background:rgba(255,255,255,0.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;">🎯</div>
        <div>
            <div style="font-size:21px;font-weight:800;letter-spacing:-0.5px;">PathMentor IA</div>
            <div style="font-size:11px;opacity:0.8;margin-top:2px;">Bolsa de Empleo Inteligente · Sistema de Mentoría</div>
        </div>
    </div>
    <div style="text-align:right;font-size:10.5px;opacity:0.9;">
        <div style="font-size:14px;font-weight:700;">${userName}</div>
        <div style="margin-top:3px;">Ruta de Aprendizaje Personalizada</div>
        <div style="margin-top:2px;">Generado: ${fecha}</div>
    </div>
</div>

<!-- BLOQUE TÍTULO -->
<div style="padding:0 28px 18px;">
    <h1 style="font-size:23px;font-weight:800;color:#333697;line-height:1.2;margin-bottom:10px;">${ruta.titulo}</h1>
    <div style="font-size:12px;color:#555;background:#f5f3ff;border-left:4px solid #7c3aed;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:14px;">🎯 <strong>Objetivo:</strong> ${ruta.objetivo_profesional}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <span style="background:#eef2ff;color:#333697;border:1px solid #c7d2fe;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;">⏱️ ${ruta.duracion_estimada_meses} meses de duración</span>
        ${ruta.nivel_inicio ? `<span style="background:#eef2ff;color:#333697;border:1px solid #c7d2fe;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;">📊 ${ruta.nivel_inicio}</span>` : ''}
        ${ruta.salario_esperado ? `<span style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;">💰 ${ruta.salario_esperado}</span>` : ''}
        <span style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;">📈 Progreso: ${pct}% (${fasesCompletadas}/${totalFases} fases)</span>
    </div>
</div>

<!-- BARRA DE PROGRESO -->
<div style="padding:0 28px 18px;">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#666;margin-bottom:6px;"><span>Progreso general</span><span><strong>${fasesCompletadas}</strong> de ${totalFases} fases completadas</span></div>
    <div style="width:100%;height:13px;background:#e5e7eb;border-radius:7px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7c3aed,#5445cf);border-radius:7px;"></div>
    </div>
</div>

<!-- DIAGNÓSTICO DE PERFIL -->
${ruta.perfil_actual ? `
<div style="padding:0 28px 18px;">
    <div style="font-size:13px;font-weight:700;color:#333697;border-bottom:2px solid #eef2ff;padding-bottom:6px;margin-bottom:12px;">📊 Diagnóstico de Perfil Actual</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;">
        <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
            <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;margin-bottom:8px;">✅ Fortalezas</div>
            <div>${(ruta.perfil_actual.fortalezas_clave || []).map(f => `<span style="display:inline-block;background:#d1fae5;color:#065f46;border-radius:12px;padding:3px 8px;font-size:9.5px;font-weight:500;margin:2px;">${f}</span>`).join('')}</div>
        </div>
        <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;padding:12px;">
            <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;margin-bottom:8px;">⚠️ Brechas a Cubrir</div>
            <div>${(ruta.perfil_actual.brechas_identificadas || []).map(b => `<span style="display:inline-block;background:#fee2e2;color:#991b1b;border-radius:12px;padding:3px 8px;font-size:9.5px;font-weight:500;margin:2px;">${b}</span>`).join('')}</div>
        </div>
    </div>
    ${ruta.perfil_actual.nivel_general ? `<p style="font-size:11px;color:#555;"><strong>Nivel general:</strong> ${ruta.perfil_actual.nivel_general}</p>` : ''}
    ${puntuacion !== undefined ? `<p style="font-size:11px;color:#555;margin-top:4px;"><strong>Puntuación de empleabilidad:</strong> ${puntuacion}/100</p>` : ''}
</div>` : ''}

<!-- TÍTULO SECCIÓN FASES -->
<div style="padding:0 28px 10px;">
    <div style="font-size:13px;font-weight:700;color:#333697;border-bottom:2px solid #eef2ff;padding-bottom:6px;">🗺️ Hoja de Ruta — ${totalFases} Fases de Aprendizaje</div>
</div>

<!-- FASES -->
<div style="padding:0 28px;">
${fasesHTML}
</div>

<!-- PRIORIDADES -->
${ruta.prioridades?.length ? `
<div style="padding:0 28px 16px;">
    <div style="font-size:13px;font-weight:700;color:#333697;border-bottom:2px solid #eef2ff;padding-bottom:6px;margin-bottom:10px;">⚡ Prioridades Clave</div>
    <div>${ruta.prioridades.map(p => `<span style="display:inline-block;background:#dbeafe;color:#1e40af;border-radius:12px;padding:4px 12px;font-size:10px;font-weight:600;margin:3px;">${p}</span>`).join('')}</div>
</div>` : ''}

<!-- INDICADORES -->
${ruta.indicadores_de_progreso?.length ? `
<div style="padding:0 28px 16px;">
    <div style="font-size:13px;font-weight:700;color:#333697;border-bottom:2px solid #eef2ff;padding-bottom:6px;margin-bottom:10px;">📈 Indicadores de Éxito</div>
    <ul style="list-style:none;padding:0;">${ruta.indicadores_de_progreso.map(ind => `<li style="font-size:11px;color:#444;padding:4px 0 4px 18px;position:relative;"><span style="position:absolute;left:0;color:#059669;font-weight:700;">✓</span>${ind}</li>`).join('')}</ul>
</div>` : ''}

<!-- PRÓXIMOS PASOS -->
${nextSteps?.length ? `
<div style="padding:0 28px 16px;">
    <div style="font-size:13px;font-weight:700;color:#333697;border-bottom:2px solid #eef2ff;padding-bottom:6px;margin-bottom:10px;">🚀 Próximos Pasos Inmediatos</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${nextSteps.map(paso => `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;font-size:10.5px;color:#92400e;">⚡ ${paso}</div>`).join('')}</div>
</div>` : ''}

<!-- PIE DE PÁGINA -->
<div style="text-align:center;font-size:9px;color:#aaa;padding:14px 28px;border-top:1px solid #e5e7eb;margin-top:10px;">
    <p>Documento generado por <strong>Bolsa Empleo IA</strong> · Sistema de Mentoría con Inteligencia Artificial · ${fecha}</p>
    <p style="margin-top:4px;">Este plan personalizado está basado en el análisis de tu CV y objetivos profesionales declarados.</p>
</div>

<script>window.onload = function(){ window.print(); }</script>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const ChatIAPage = () => {
    const authUser = useAuthStore((state) => state.user);
    const location = useLocation();
    const rutaIdFromNavRef = useRef<number | null>((location.state as any)?.rutaId ?? null);
    const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
    const [historial, setHistorial] = useState<ChatIAType[]>([]);
    const [rutasGuardadas, setRutasGuardadas] = useState<RutaGuardada[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [inputMensaje, setInputMensaje] = useState('');
    const [rutaAprendizaje, setRutaAprendizaje] = useState<RutaAprendizajeData | null>(null);
    const [rutaGuardadaActual, setRutaGuardadaActual] = useState<RutaGuardada | null>(null);
    const [chatActualId, setChatActualId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [historialAbierto, setHistorialAbierto] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>('historial');
    const [loading, setLoading] = useState(true);
    const [faseProgress, setFaseProgress] = useState<FaseProgress>({});
    const [modoActivo, setModoActivo] = useState<ModoChat>(null);
    const [savingRuta, setSavingRuta] = useState(false);
    const [rutaPanelOpen, setRutaPanelOpen] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchCVDataUsuario();
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (userData?.persona?.id) {
            cargarHistorial(userData.persona.id);
            cargarRutasGuardadas(userData.persona.id);
        }
    }, [userData]);

    useEffect(() => { scrollToBottom(); }, [mensajes]);

    useEffect(() => {
        if (!isLoading) inputRef.current?.focus();
    }, [isLoading]);

    const fetchCVDataUsuario = async () => {
        if (!authUser?.id) return;
        try {
            const data = await UserService.obtenerPersonaPorUsuario(authUser.id);
            setUserData(data);
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarHistorial = async (personaId: number) => {
        try {
            const data = await ChatService.obtenerPorPersona(personaId);
            setHistorial(data || []);
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    };

    const cargarRutasGuardadas = async (personaId: number) => {
        try {
            const data: RutaGuardada[] = await RutaService.listarPorPersona(personaId);
            setRutasGuardadas(data || []);
            if (rutaIdFromNavRef.current && data?.length) {
                const ruta = data.find(r => r.id === rutaIdFromNavRef.current);
                if (ruta) {
                    handleCargarRutaGuardada(ruta);
                    rutaIdFromNavRef.current = null;
                }
            }
        } catch (error) {
            console.error('Error cargando rutas guardadas:', error);
        }
    };

    const scrollToBottom = (smooth = true) => {
        scrollRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        setShowScrollButton(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };

    const handleEnviarMensaje = async (mensajeOverride?: string) => {
        const mensajeTexto = (mensajeOverride ?? inputMensaje).trim();
        if (!mensajeTexto || isLoading) return;
        let chatId = chatActualId;

        if (!chatActualId) {
            try {
                const nuevoChat = await ChatService.crear(userData.persona.id, mensajeTexto.substring(0, 50));
                chatId = nuevoChat.id;
                setChatActualId(nuevoChat.id);
            } catch {
                toast.error('Error al crear el chat');
                return;
            }
        }

        const mensajeUsuario: MensajeUI = {
            id: `temp-${Date.now()}`,
            tipo: 'usuario',
            contenido: mensajeTexto,
            timestamp: new Date().toISOString(),
        };
        setMensajes(prev => [...prev, mensajeUsuario]);
        if (!mensajeOverride) setInputMensaje('');
        setIsLoading(true);

        setMensajes(prev => [...prev, {
            id: `typing-${Date.now()}`, tipo: 'ia', contenido: '', timestamp: new Date().toISOString(), loading: true,
        }]);

        try {
            const respuesta = await ConversacionService.enviarMensaje(
                chatId!,
                userData.persona.id,
                mensajeTexto,
                undefined,
                modoActivo,
            );

            let contenidoRespuesta = respuesta.respuesta;
            let esRutaAprendizaje = false;

            try {
                const jsonMatch = contenidoRespuesta.match(/\{[\s\S]*"tipo"\s*:\s*"ruta_aprendizaje"[\s\S]*\}/);
                if (jsonMatch) {
                    const rutaData: RutaAprendizajeData = JSON.parse(jsonMatch[0]);
                    setRutaAprendizaje(rutaData);
                    setFaseProgress({});
                    setRutaGuardadaActual(null);
                    setRutaPanelOpen(true);
                    esRutaAprendizaje = true;
                    contenidoRespuesta = '✅ He generado tu ruta de aprendizaje personalizada. Puedes verla en el panel derecho.';
                    // Auto-guardar la ruta
                    autoGuardarRuta(rutaData, chatId!);
                }
            } catch (_) { /* not JSON */ }

            setMensajes(prev => [
                ...prev.filter(m => !m.loading),
                {
                    id: respuesta.id || `ia-${Date.now()}`,
                    tipo: 'ia',
                    contenido: contenidoRespuesta,
                    timestamp: respuesta.created_at || new Date().toISOString(),
                    esRutaAprendizaje,
                },
            ]);

            await cargarHistorial(userData.persona.id);
        } catch {
            toast.error('Error al enviar el mensaje');
            setMensajes(prev => prev.filter(m => !m.loading));
        } finally {
            setIsLoading(false);
        }
    };

    const autoGuardarRuta = async (rutaData: RutaAprendizajeData, chatId: number) => {
        if (!userData?.persona?.id) return;
        setSavingRuta(true);
        try {
            const guardada = await RutaService.guardar(userData.persona.id, rutaData, chatId);
            setRutaGuardadaActual(guardada);
            setRutasGuardadas(prev => [guardada, ...prev]);
            setRutaPanelOpen(true);
            toast.success('Ruta guardada automáticamente');
        } catch {
            // silencioso — no es crítico
        } finally {
            setSavingRuta(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviarMensaje();
        }
    };

    const handleNuevaConversacion = async () => {
        try {
            const nuevoChat = await ChatService.crear(userData.persona.id, 'Nueva sesión');
            setChatActualId(nuevoChat.id);
            setMensajes([]);
            setInputMensaje('');
            setRutaAprendizaje(null);
            setRutaGuardadaActual(null);
            setModoActivo(null);
            inputRef.current?.focus();

            const respuesta = await ConversacionService.enviarMensaje(
                nuevoChat.id, userData.persona.id, '__INIT__', { esNuevaConversacion: true }
            );
            setMensajes([{
                id: respuesta.id || `ia-${Date.now()}`,
                tipo: 'ia',
                contenido: respuesta.respuesta,
                timestamp: new Date().toISOString(),
            }]);

            toast.success('Nueva sesión iniciada');
            await cargarHistorial(userData.persona.id);
        } catch {
            toast.error('Error al iniciar sesión');
        }
    };

    const handleEliminarChat = async (id: number) => {
        try {
            await ChatService.eliminar(id);
            if (chatActualId === id) {
                setMensajes([]);
                setChatActualId(null);
                setRutaAprendizaje(null);
                setRutaGuardadaActual(null);
            }
            toast.success('Sesión eliminada');
            await cargarHistorial(userData.persona.id);
        } catch {
            toast.error('Error al eliminar la sesión');
        }
    };

    const handleCargarConversacion = async (chat: ChatIAType) => {
        try {
            const conversaciones = await ConversacionService.listarConversacionesPorChat(chat.id);
            const filtradas = conversaciones.filter((m: any) => !(m.respuesta_chat === 0 && m.mensaje === '__INIT__'));
            const mapped: MensajeUI[] = [];

            filtradas.forEach((conv: any) => {
                if (conv.respuesta_chat === 0) {
                    mapped.push({ id: `${conv.id}-user`, tipo: 'usuario', contenido: conv.mensaje, timestamp: conv.created_at });
                } else if (conv.respuesta_chat === 1) {
                    let contenido = conv.respuesta;
                    let esRuta = false;
                    if (conv.json === 1) {
                        try {
                            const jsonMatch = contenido.match(/\{[\s\S]*"tipo"\s*:\s*"ruta_aprendizaje"[\s\S]*\}/);
                            if (jsonMatch) {
                                const rutaData: RutaAprendizajeData = JSON.parse(jsonMatch[0]);
                                setRutaAprendizaje(rutaData);
                                setFaseProgress({});
                                setRutaGuardadaActual(null);
                                // Buscar si ya existe en rutas guardadas para cargar su progreso
                                const rutaExistente = rutasGuardadas.find(r => r.chat_id === chat.id);
                                if (rutaExistente) {
                                    setRutaGuardadaActual(rutaExistente);
                                    try {
                                        setFaseProgress(JSON.parse(rutaExistente.progreso_fases || '{}'));
                                    } catch (_) {}
                                }
                                contenido = '✅ He generado tu ruta de aprendizaje personalizada. Puedes verla en el panel derecho.';
                                esRuta = true;
                            }
                        } catch (_) { /* ignore */ }
                    }
                    mapped.push({ id: `${conv.id}-ia`, tipo: 'ia', contenido, timestamp: conv.created_at, esRutaAprendizaje: esRuta });
                }
            });

            setMensajes(mapped);
            setChatActualId(chat.id);
            setModoActivo(null);
        } catch {
            toast.error('Error al cargar la sesión');
        }
    };

    const handleCargarRutaGuardada = (ruta: RutaGuardada) => {
        try {
            const rutaData: RutaAprendizajeData = JSON.parse(ruta.json_ruta);
            setRutaAprendizaje(rutaData);
            setRutaGuardadaActual(ruta);
            setRutaPanelOpen(true);
            try {
                setFaseProgress(JSON.parse(ruta.progreso_fases || '{}'));
            } catch (_) {
                setFaseProgress({});
            }
            toast.success('Ruta cargada');
        } catch {
            toast.error('Error al cargar la ruta');
        }
    };

    const handleEliminarRuta = async (rutaId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await RutaService.eliminar(rutaId);
            setRutasGuardadas(prev => prev.filter(r => r.id !== rutaId));
            if (rutaGuardadaActual?.id === rutaId) {
                setRutaGuardadaActual(null);
                setRutaAprendizaje(null);
                setFaseProgress({});
            }
            toast.success('Ruta eliminada');
        } catch {
            toast.error('Error al eliminar la ruta');
        }
    };

    const toggleFase = useCallback(async (key: string) => {
        const nuevoProgreso = { ...faseProgress, [key]: !faseProgress[key] };
        setFaseProgress(nuevoProgreso);
        if (rutaGuardadaActual?.id) {
            try {
                await RutaService.actualizarProgreso(rutaGuardadaActual.id, nuevoProgreso);
                setRutaGuardadaActual(prev => prev ? { ...prev, progreso_fases: JSON.stringify(nuevoProgreso) } : prev);
            } catch {
                // revertir si falla
                setFaseProgress(faseProgress);
                toast.error('Error al guardar el progreso');
            }
        }
    }, [faseProgress, rutaGuardadaActual]);

    const handleExplorarFaseDesdeChat = (faseNombre: string) => {
        setModoActivo('explorar_fase');
        setInputMensaje(`Quiero explorar en detalle la fase: "${faseNombre}"`);
        inputRef.current?.focus();
    };

    const handleSeleccionarFase = (faseNombre: string) => {
        handleEnviarMensaje(`Explora en detalle la fase: "${faseNombre}"`);
    };

    const handleExportarRuta = () => {
        if (!rutaAprendizaje) return;
        printRuta(rutaAprendizaje, nombreUsuario, rutaGuardadaActual);
    };

    const handleActivarModo = async (modo: ModoChat) => {
        if (modoActivo === modo) {
            setModoActivo(null);
            return;
        }

        const titulos: Record<NonNullable<ModoChat>, string> = {
            entrevista: 'Simulacro de entrevista',
            explorar_fase: 'Explorar ruta por fases',
            recursos: 'Curación de recursos',
        };
        const initMsgs: Record<NonNullable<ModoChat>, string> = {
            entrevista: 'Inicia el simulacro de entrevista',
            explorar_fase: 'Inicia el modo explorar fase de mi ruta de aprendizaje',
            recursos: 'Inicia el modo curación de recursos para mi perfil',
        };

        try {
            const nuevoChat = await ChatService.crear(userData.persona.id, titulos[modo!]);
            setChatActualId(nuevoChat.id);
            setMensajes([]);
            setModoActivo(modo);

            if (modo === 'explorar_fase') {
                const rutaActivaGuardada = rutasGuardadas.find(r => r.estado === 'activa') || rutasGuardadas[0];
                if (rutaActivaGuardada) {
                    try {
                        const rutaData: RutaAprendizajeData = JSON.parse(rutaActivaGuardada.json_ruta);
                        setRutaAprendizaje(rutaData);
                        setRutaGuardadaActual(rutaActivaGuardada);
                        setRutaPanelOpen(true);
                        try { setFaseProgress(JSON.parse(rutaActivaGuardada.progreso_fases || '{}')); } catch (_) {}
                    } catch (_) {}
                } else {
                    setRutaAprendizaje(null);
                    setRutaGuardadaActual(null);
                }
            } else {
                setRutaAprendizaje(null);
                setRutaGuardadaActual(null);
            }

            setIsLoading(true);
            setMensajes([{ id: `typing-${Date.now()}`, tipo: 'ia', contenido: '', timestamp: new Date().toISOString(), loading: true }]);

            const respuesta = await ConversacionService.enviarMensaje(
                nuevoChat.id, userData.persona.id, initMsgs[modo!], undefined, modo
            );
            setMensajes([{
                id: respuesta.id || `ia-${Date.now()}`,
                tipo: 'ia',
                contenido: respuesta.respuesta,
                timestamp: new Date().toISOString(),
            }]);
            await cargarHistorial(userData.persona.id);
        } catch {
            toast.error('Error al iniciar el modo');
            setModoActivo(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Quick suggestions
    const persona = userData?.persona;
    const titulo = persona?.titulo_profesional;
    const sector = persona?.sector_interes;

    const sugerencias = [
        {
            icon: <Target className="w-4 h-4" />,
            texto: 'Genera mi ruta de aprendizaje personalizada',
            color: 'from-violet-500 to-purple-600',
        },
        {
            icon: <BarChart3 className="w-4 h-4" />,
            texto: titulo ? `¿Cuáles son mis brechas para ser ${titulo}?` : '¿Cuáles son mis brechas de conocimiento?',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            icon: <BookOpen className="w-4 h-4" />,
            texto: sector ? `Recomiéndame cursos de ${sector}` : 'Recomiéndame cursos según mi perfil',
            color: 'from-sky-500 to-blue-600',
        },
        {
            icon: <Briefcase className="w-4 h-4" />,
            texto: titulo ? `Prepárame para una entrevista como ${titulo}` : 'Ayúdame a prepararme para entrevistas',
            color: 'from-teal-500 to-cyan-600',
        },
    ];

    const agruparPorFecha = (chats: ChatIAType[]) => {
        const hoy = new Date();
        const grupos: Record<string, ChatIAType[]> = { 'Hoy': [], 'Ayer': [], 'Esta semana': [], 'Más antiguo': [] };
        chats.forEach(chat => {
            const diff = Math.floor((hoy.getTime() - new Date(chat.created_at).getTime()) / 86400000);
            if (diff === 0) grupos['Hoy'].push(chat);
            else if (diff === 1) grupos['Ayer'].push(chat);
            else if (diff <= 7) grupos['Esta semana'].push(chat);
            else grupos['Más antiguo'].push(chat);
        });
        return grupos;
    };

    const gruposHistorial = agruparPorFecha(historial);
    const nombreUsuario = persona?.nombre || authUser?.nombre || 'Profesional';

    return (
        <div className="h-full w-full flex overflow-hidden bg-background print:block">

            {/* ── Panel Izquierdo – Sidebar ──────────────────────────────── */}
            <div className={cn(
                'transition-all duration-300 border-r border-border bg-card flex flex-col flex-shrink-0 print:hidden',
                historialAbierto ? 'w-72' : 'w-0 overflow-hidden'
            )}>
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-foreground">Mentor IA</p>
                            <p className="text-xs text-muted-foreground/60">Rutas personalizadas</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleNuevaConversacion}
                        disabled={loading}
                        className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-sm h-9"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva sesión
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setSidebarTab('historial')}
                        className={cn(
                            'flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors',
                            sidebarTab === 'historial'
                                ? 'text-violet-600 border-b-2 border-violet-500'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Sesiones
                    </button>
                    <button
                        onClick={() => setSidebarTab('rutas')}
                        className={cn(
                            'flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors',
                            sidebarTab === 'rutas'
                                ? 'text-violet-600 border-b-2 border-violet-500'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Map className="w-3.5 h-3.5" />
                        Mis Rutas
                        {rutasGuardadas.length > 0 && (
                            <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] px-1.5 rounded-full font-bold">
                                {rutasGuardadas.length}
                            </span>
                        )}
                    </button>
                </div>

                <ScrollArea className="flex-1">
                    {sidebarTab === 'historial' ? (
                        <div className="p-3 space-y-4">
                            {Object.entries(gruposHistorial).map(([grupo, chats]) =>
                                chats.length > 0 && (
                                    <div key={grupo}>
                                        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">{grupo}</p>
                                        <div className="space-y-1">
                                            {chats.map(chat => (
                                                <div
                                                    key={chat.id}
                                                    onClick={() => handleCargarConversacion(chat)}
                                                    className={cn(
                                                        'group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all',
                                                        chatActualId === chat.id
                                                            ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800'
                                                            : 'hover:bg-muted/50 border border-transparent'
                                                    )}
                                                >
                                                    <MessageSquare className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', chatActualId === chat.id ? 'text-violet-600' : 'text-muted-foreground/60')} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn('text-xs font-medium line-clamp-2 leading-snug', chatActualId === chat.id ? 'text-violet-700 dark:text-violet-400' : 'text-foreground')}>
                                                            {chat.titulo || 'Sesión sin título'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                                                            {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true, locale: es })}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm" variant="ghost"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                        onClick={e => { e.stopPropagation(); handleEliminarChat(chat.id); }}
                                                    >
                                                        <Trash2 className="w-3 h-3 text-red-400" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                            {historial.length === 0 && !loading && (
                                <div className="text-center py-10 px-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                        <History className="w-6 h-6 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed">Aún no hay sesiones.<br />¡Inicia tu primera consulta!</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 space-y-2">
                            {rutasGuardadas.length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                        <Map className="w-6 h-6 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                        Aún no tienes rutas guardadas.<br />Genera tu primera ruta de aprendizaje.
                                    </p>
                                </div>
                            ) : (
                                rutasGuardadas.map(ruta => {
                                    let progreso: Record<string, boolean> = {};
                                    try { progreso = JSON.parse(ruta.progreso_fases || '{}'); } catch (_) {}
                                    const rutaData: RutaAprendizajeData | null = (() => { try { return JSON.parse(ruta.json_ruta); } catch (_) { return null; } })();
                                    const totalFases = rutaData?.fases?.length || 0;
                                    const completadas = Object.values(progreso).filter(Boolean).length;
                                    const pct = totalFases > 0 ? Math.round((completadas / totalFases) * 100) : 0;
                                    const isActive = rutaGuardadaActual?.id === ruta.id;

                                    return (
                                        <div
                                            key={ruta.id}
                                            onClick={() => handleCargarRutaGuardada(ruta)}
                                            className={cn(
                                                'group p-3 rounded-lg border cursor-pointer transition-all',
                                                isActive
                                                    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
                                                    : 'bg-card border-border hover:border-violet-200 hover:shadow-sm'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className={cn('text-xs font-semibold line-clamp-2 leading-snug flex-1', isActive ? 'text-violet-700 dark:text-violet-400' : 'text-foreground')}>
                                                    {ruta.titulo}
                                                </p>
                                                <Button
                                                    size="sm" variant="ghost"
                                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                    onClick={(e) => handleEliminarRuta(ruta.id, e)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </Button>
                                            </div>

                                            {/* Mini progreso */}
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground/60">{pct}% completado</span>
                                                <div className="flex items-center gap-1">
                                                    {ruta.duracion_meses && (
                                                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                                                            <Clock className="w-2.5 h-2.5" />{ruta.duracion_meses}m
                                                        </span>
                                                    )}
                                                    <Badge className={cn(
                                                        'text-[10px] px-1.5 py-0 h-4 font-normal',
                                                        ruta.estado === 'completada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                                        ruta.estado === 'archivada' ? 'bg-muted text-muted-foreground' :
                                                        'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400'
                                                    )}>
                                                        {ruta.estado}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* ── Panel Central – Chat ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 print:hidden">

                {/* Header */}
                <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => setHistorialAbierto(!historialAbierto)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <History className="w-5 h-5" />
                            </Button>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground text-sm">Mentor de Carrera IA</h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                                    <span className="text-xs text-muted-foreground">Listo para ayudarte</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Modo activo badge */}
                            {modoActivo && (
                                <Badge className={cn('gap-1 text-xs border', MODO_CONFIG[modoActivo].color)}>
                                    {MODO_CONFIG[modoActivo].icon}
                                    {MODO_CONFIG[modoActivo].label}
                                    <button onClick={() => setModoActivo(null)} className="ml-0.5 hover:opacity-70">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </Badge>
                            )}
                            {persona?.titulo_profesional && (
                                <Badge variant="secondary" className="gap-1 text-xs hidden sm:flex">
                                    <Briefcase className="w-3 h-3" />
                                    {persona.titulo_profesional}
                                </Badge>
                            )}
                            {persona?.nivel_educativo && (
                                <Badge variant="outline" className="gap-1 text-xs hidden md:flex">
                                    <GraduationCap className="w-3 h-3" />
                                    {persona.nivel_educativo}
                                </Badge>
                            )}
                            {mensajes.length > 0 && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                    <MessageSquare className="w-3 h-3" />
                                    {mensajes.length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Barra de modos */}
                    <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-0.5">
                        <span className="text-xs text-muted-foreground/60 flex-shrink-0">Modos:</span>
                        <button
                            onClick={() => handleActivarModo('entrevista')}
                            disabled={isLoading}
                            title={modoActivo && modoActivo !== 'entrevista' ? 'Iniciará una nueva sesión dedicada de entrevista' : undefined}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex-shrink-0 disabled:cursor-wait',
                                modoActivo === 'entrevista'
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                                    : modoActivo !== null
                                        ? 'border-border text-muted-foreground/40 hover:border-amber-300 hover:text-amber-500'
                                        : 'border-border text-muted-foreground hover:border-amber-300 hover:text-amber-600'
                            )}
                        >
                            <Mic className="w-3 h-3" /> Entrevista
                        </button>
                        <button
                            onClick={() => handleActivarModo('explorar_fase')}
                            disabled={isLoading}
                            title={modoActivo && modoActivo !== 'explorar_fase' ? 'Iniciará una nueva sesión dedicada de exploración' : undefined}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex-shrink-0 disabled:cursor-wait',
                                modoActivo === 'explorar_fase'
                                    ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700'
                                    : modoActivo !== null
                                        ? 'border-border text-muted-foreground/40 hover:border-sky-300 hover:text-sky-500'
                                        : 'border-border text-muted-foreground hover:border-sky-300 hover:text-sky-600'
                            )}
                        >
                            <Layers className="w-3 h-3" /> Explorar fase
                        </button>
                        <button
                            onClick={() => handleActivarModo('recursos')}
                            disabled={isLoading}
                            title={modoActivo && modoActivo !== 'recursos' ? 'Iniciará una nueva sesión dedicada de recursos' : undefined}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex-shrink-0 disabled:cursor-wait',
                                modoActivo === 'recursos'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                                    : modoActivo !== null
                                        ? 'border-border text-muted-foreground/40 hover:border-emerald-300 hover:text-emerald-500'
                                        : 'border-border text-muted-foreground hover:border-emerald-300 hover:text-emerald-600'
                            )}
                        >
                            <BookMarked className="w-3 h-3" /> Recursos
                        </button>
                    </div>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto relative" onScroll={handleScroll}>
                    <div className="h-full">
                        {mensajes.length === 0 ? (
                            <WelcomeState
                                nombre={nombreUsuario}
                                titulo={titulo}
                                sugerencias={sugerencias}
                                onSugerencia={setInputMensaje}
                            />
                        ) : (
                            <div className="p-6 space-y-4 max-w-3xl mx-auto pb-4">
                                {mensajes.map(m => (
                                    <MensajeBurbuja key={m.id} mensaje={m} />
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>

                    {showScrollButton && (
                        <div className="absolute bottom-4 right-6">
                            <Button size="sm" className="rounded-full shadow-lg h-8 w-8 p-0 bg-card border border-border text-muted-foreground hover:bg-muted/50"
                                onClick={() => scrollToBottom()}>
                                <ArrowDown className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="border-t border-border bg-card p-4 flex-shrink-0">
                    <div className="max-w-3xl mx-auto">
                        {/* Phase selector — visible when explorar_fase is active and a route is loaded */}
                        {modoActivo === 'explorar_fase' && rutaAprendizaje?.fases && rutaAprendizaje.fases.length > 0 && (
                            <div className="mb-2 border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 rounded-xl px-3 py-2.5">
                                <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-2 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5" />
                                    Selecciona una fase para explorar:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {rutaAprendizaje.fases.map((fase, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSeleccionarFase(fase.nombre)}
                                            disabled={isLoading}
                                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-sky-300 dark:border-sky-700 bg-white dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="font-bold">F{fase.fase}</span>
                                            <span className="max-w-[120px] truncate">{fase.nombre}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {modoActivo && (
                            <div className={cn('flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg text-xs border', MODO_CONFIG[modoActivo].color)}>
                                {MODO_CONFIG[modoActivo].icon}
                                <span className="font-medium">{MODO_CONFIG[modoActivo].label} activo</span>
                                <span className="text-muted-foreground">— cada mensaje usa este contexto</span>
                            </div>
                        )}
                        <div className="flex gap-3 items-end">
                            <Textarea
                                ref={inputRef}
                                value={inputMensaje}
                                onChange={e => setInputMensaje(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    modoActivo === 'entrevista' ? 'Responde la pregunta del entrevistador...' :
                                    modoActivo === 'explorar_fase' ? 'Indica qué fase o tema quieres explorar...' :
                                    modoActivo === 'recursos' ? 'Pide recursos sobre alguna tecnología o tema...' :
                                    'Pregúntame sobre tu ruta de carrera, habilidades, cursos...'
                                }
                                className="min-h-[52px] max-h-[180px] resize-none text-sm rounded-xl border-border focus:border-violet-400 focus:ring-violet-300"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleEnviarMensaje}
                                disabled={!inputMensaje.trim() || isLoading}
                                className="h-[52px] w-[52px] p-0 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 flex-shrink-0"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </Button>
                        </div>
                        <p className="text-xs text-center text-muted-foreground/60 mt-2">
                            Enter para enviar · Shift+Enter para nueva línea
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating "Ver Ruta" button – visible on mobile only when panel is closed */}
            {rutaAprendizaje && !rutaPanelOpen && (
                <button
                    onClick={() => setRutaPanelOpen(true)}
                    className="fixed bottom-24 right-4 z-30 lg:hidden flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl transition-all"
                >
                    <Map className="w-4 h-4" />
                    Ver mi Ruta
                </button>
            )}

            {/* ── Panel Derecho – Ruta de Aprendizaje ─────────────────────── */}
            {rutaAprendizaje && (
                <>
                    {/* Mobile backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                        style={{ opacity: rutaPanelOpen ? 1 : 0, pointerEvents: rutaPanelOpen ? 'auto' : 'none' }}
                        onClick={() => setRutaPanelOpen(false)}
                    />
                <div className={cn(
                    'flex flex-col bg-card flex-shrink-0',
                    // Mobile: fixed drawer from right
                    'fixed inset-y-0 right-0 z-50 w-[92vw] sm:w-[420px] border-l border-border',
                    'transition-transform duration-300',
                    rutaPanelOpen ? 'translate-x-0' : 'translate-x-full',
                    // Desktop: always visible inline
                    'lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:w-[420px]',
                )}>
                    <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">Ruta de Aprendizaje</h3>
                                <p className="text-xs text-muted-foreground">
                                    {rutaGuardadaActual ? '✓ Guardada' : (savingRuta ? 'Guardando…' : 'Generada por IA')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-muted-foreground print:hidden"
                                title="Exportar / Imprimir"
                                onClick={handleExportarRuta}
                            >
                                <Download className="w-3.5 h-3.5" />
                            </Button>
                            {/* Close on mobile — just hides panel */}
                            <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-muted-foreground lg:hidden"
                                onClick={() => setRutaPanelOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            {/* Close on desktop — removes ruta */}
                            <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-muted-foreground hidden lg:flex"
                                onClick={() => { setRutaAprendizaje(null); setRutaGuardadaActual(null); }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            <RutaAprendizajePanel
                                ruta={rutaAprendizaje}
                                faseProgress={faseProgress}
                                onToggleFase={toggleFase}
                                onExplorarFase={handleExplorarFaseDesdeChat}
                            />
                        </div>
                    </ScrollArea>
                </div>
                </>
            )}
        </div>
    );
};

// ─── Welcome State ─────────────────────────────────────────────────────────────
const WelcomeState = ({
    nombre, titulo, sugerencias, onSugerencia
}: {
    nombre: string;
    titulo?: string;
    sugerencias: { icon: React.ReactNode; texto: string; color: string }[];
    onSugerencia: (text: string) => void;
}) => (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-card flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
            </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-1">¡Hola, {nombre}!</h3>
        <p className="text-muted-foreground mb-1 text-sm font-medium">
            {titulo ? `Mentor de carrera para ${titulo}` : 'Tu Mentor de Carrera con IA'}
        </p>
        <p className="text-muted-foreground/60 text-sm mb-8 max-w-md">
            Analizo tu CV y perfil para generar rutas de aprendizaje personalizadas,
            identificar brechas de conocimiento y recomendarte los mejores recursos.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
            {sugerencias.map((s, i) => (
                <button
                    key={i}
                    onClick={() => onSugerencia(s.texto)}
                    className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:border-violet-300 hover:shadow-md transition-all text-left"
                >
                    <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white', s.color)}>
                        {s.icon}
                    </div>
                    <p className="text-xs font-medium text-foreground group-hover:text-violet-600 leading-snug">{s.texto}</p>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-violet-500 self-end" />
                </button>
            ))}
        </div>

        <p className="text-xs text-muted-foreground/60 mt-8 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            El Mentor tiene acceso a tu CV y perfil para respuestas personalizadas
        </p>
    </div>
);

// ─── Burbuja de mensaje ────────────────────────────────────────────────────────
const MensajeBurbuja = ({ mensaje }: { mensaje: MensajeUI }) => {
    const esUsuario = mensaje.tipo === 'usuario';
    return (
        <div className={cn('flex gap-3 animate-in fade-in slide-in-from-bottom-2', esUsuario ? 'flex-row-reverse' : 'flex-row')}>
            <Avatar className={cn('h-8 w-8 flex-shrink-0 rounded-xl', esUsuario ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-violet-500 to-purple-600')}>
                <AvatarFallback className="bg-transparent rounded-xl">
                    {esUsuario ? <User className="h-4 w-4 text-white" /> : <Brain className="h-4 w-4 text-white" />}
                </AvatarFallback>
            </Avatar>

            <div className={cn('flex flex-col max-w-[75%]', esUsuario ? 'items-end' : 'items-start')}>
                <div className={cn(
                    'rounded-2xl px-4 py-3',
                    esUsuario
                        ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-tr-sm'
                        : 'bg-card border border-border text-foreground shadow-sm rounded-tl-sm'
                )}>
                    {mensaje.loading ? (
                        <div className="flex gap-1 py-1">
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    ) : (
                        <MessageContent content={mensaje.contenido} />
                    )}
                </div>
                {mensaje.esRutaAprendizaje && (
                    <Badge className="mt-1 gap-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700">
                        <Target className="w-3 h-3" /> Ruta generada
                    </Badge>
                )}
                <span className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(mensaje.timestamp), { addSuffix: true, locale: es })}
                </span>
            </div>
        </div>
    );
};

// ─── Panel Ruta de Aprendizaje ─────────────────────────────────────────────────
const RutaAprendizajePanel = ({
    ruta,
    faseProgress,
    onToggleFase,
    onExplorarFase,
}: {
    ruta: RutaAprendizajeData;
    faseProgress: FaseProgress;
    onToggleFase: (key: string) => void;
    onExplorarFase: (faseNombre: string) => void;
}) => {
    const [fasesExpandidas, setFasesExpandidas] = useState<Record<number, boolean>>({});

    if (!ruta || ruta.tipo !== 'ruta_aprendizaje') return null;

    const totalFases = ruta.fases?.length || 0;
    const completadas = Object.values(faseProgress).filter(Boolean).length;
    const pct = totalFases > 0 ? Math.round((completadas / totalFases) * 100) : 0;

    const toggleExpanded = (idx: number) => {
        setFasesExpandidas(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="space-y-5">

            {/* Título de la ruta */}
            <div>
                <h4 className="font-bold text-sm text-foreground leading-snug">{ruta.titulo}</h4>
            </div>

            {/* Objetivo + duración */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-100 dark:border-violet-800">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-0.5">Objetivo</p>
                        <p className="text-sm font-medium text-foreground leading-snug">{ruta.objetivo_profesional}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/60 dark:bg-white/10 px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-violet-500" />
                        {ruta.duracion_estimada_meses} meses
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/60 dark:bg-white/10 px-2 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-violet-500" />
                        Meta: {addMonthsToNow(ruta.duracion_estimada_meses)}
                    </div>
                    {ruta.salario_esperado && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {ruta.salario_esperado}
                        </div>
                    )}
                </div>
                {ruta.nivel_inicio && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                        <span className="font-medium">Nivel inicio:</span> {ruta.nivel_inicio}
                    </p>
                )}
            </div>

            {/* Progreso general */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-foreground">Tu progreso</p>
                    <span className="text-xs text-violet-600 font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">{completadas} de {totalFases} fases completadas</p>
            </div>

            {/* Perfil actual */}
            {ruta.perfil_actual && (
                <Card className="border-border shadow-none">
                    <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-violet-500" /> Perfil Actual
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-2">
                        {ruta.perfil_actual.nivel_general && (
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Nivel:</span> {ruta.perfil_actual.nivel_general}
                            </p>
                        )}
                        {ruta.perfil_actual.puntuacion_empleabilidad !== undefined && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-semibold text-foreground">Empleabilidad</p>
                                    <span className="text-xs font-bold text-violet-600">{ruta.perfil_actual.puntuacion_empleabilidad}/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" style={{ width: `${ruta.perfil_actual.puntuacion_empleabilidad}%` }} />
                                </div>
                            </div>
                        )}
                        {ruta.perfil_actual.fortalezas_clave?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Fortalezas</p>
                                <div className="flex flex-wrap gap-1">
                                    {ruta.perfil_actual.fortalezas_clave.map((f, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-normal">
                                            {f}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {ruta.perfil_actual.brechas_identificadas?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-foreground mb-1">Brechas detectadas</p>
                                <div className="flex flex-wrap gap-1">
                                    {ruta.perfil_actual.brechas_identificadas.map((b, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 font-normal">
                                            {b}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Timeline de fases */}
            {ruta.fases?.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                        Hoja de Ruta
                    </p>
                    <div className="relative">
                        <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gradient-to-b from-violet-300 via-blue-300 to-teal-300" />

                        <div className="space-y-4">
                            {ruta.fases.map((fase, idx) => {
                                const c = getPhaseColor(idx);
                                const key = `${ruta.objetivo_profesional}-fase-${idx}`;
                                const done = faseProgress[key] ?? false;
                                const expanded = fasesExpandidas[idx] ?? false;

                                return (
                                    <div key={idx} className="flex gap-3">
                                        {/* Dot */}
                                        <button
                                            onClick={() => onToggleFase(key)}
                                            className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all z-10 relative bg-card', done ? 'border-violet-500' : 'border-border hover:border-violet-400')}
                                        >
                                            {done
                                                ? <CheckCircle2 className="w-4 h-4 text-violet-600" />
                                                : <Circle className="w-3.5 h-3.5 text-muted-foreground/60" />
                                            }
                                        </button>

                                        {/* Card */}
                                        <div className={cn('flex-1 rounded-xl border', done ? 'bg-muted/50 opacity-75' : 'bg-card', c.border)}>
                                            {/* Header de la fase — siempre visible */}
                                            <div className="flex items-start justify-between gap-2 p-3">
                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Badge className={cn('text-xs font-semibold border', c.bg, c.text, c.border)}>
                                                            Fase {fase.fase}
                                                        </Badge>
                                                        {fase.nivel_dificultad && (
                                                            <Badge variant="outline" className="text-[10px] py-0 h-4 font-normal text-muted-foreground">
                                                                {fase.nivel_dificultad}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className={cn('text-sm font-bold leading-snug', done ? 'line-through text-muted-foreground' : 'text-foreground')}>
                                                        {fase.nombre}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                                                        {fase.duracion_meses}m
                                                    </span>
                                                    <button
                                                        onClick={() => toggleExpanded(idx)}
                                                        className="text-muted-foreground/60 hover:text-muted-foreground"
                                                    >
                                                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Contenido expandible */}
                                            {expanded && (
                                                <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
                                                    {fase.objetivo && (
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{fase.objetivo}</p>
                                                    )}

                                                    {fase.competencias_a_desarrollar?.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Competencias</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {fase.competencias_a_desarrollar.map((comp, ci) => (
                                                                    <Badge key={ci} variant="outline" className="text-xs font-normal py-0">{comp}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {fase.acciones_recomendadas?.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" /> Acciones
                                                            </p>
                                                            <ul className="space-y-0.5">
                                                                {fase.acciones_recomendadas.map((acc, ai) => (
                                                                    <li key={ai} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                                                                        <ChevronRight className="w-3 h-3 mt-0.5 text-muted-foreground/60 flex-shrink-0" />
                                                                        {acc}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Recursos clave */}
                                                    {fase.recursos_clave && fase.recursos_clave.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3 text-blue-500" /> Recursos Clave
                                                            </p>
                                                            <ul className="space-y-0.5">
                                                                {fase.recursos_clave.map((rec, ri) => (
                                                                    <li key={ri} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                                                                        <span className="text-blue-400 mt-0.5 flex-shrink-0">📖</span>
                                                                        {rec}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Checklist de dominio */}
                                                    {fase.checklist_dominio && fase.checklist_dominio.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Checklist de dominio
                                                            </p>
                                                            <div className="space-y-1">
                                                                {fase.checklist_dominio.map((item, ci) => (
                                                                    <div key={ci} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                        <div className="w-3.5 h-3.5 border-2 border-border rounded-sm flex-shrink-0" />
                                                                        {item}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {fase.resultado_esperado && (
                                                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800">
                                                            <p className="text-xs text-green-700 dark:text-green-400 flex gap-1.5 items-start">
                                                                <Award className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                                                                {fase.resultado_esperado}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Botón explorar */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full h-7 text-xs gap-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30 mt-1"
                                                        onClick={() => onExplorarFase(fase.nombre)}
                                                    >
                                                        <Zap className="w-3 h-3" />
                                                        Explorar esta fase en detalle
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Prioridades */}
            {ruta.prioridades?.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 shadow-none">
                    <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400">
                            <Lightbulb className="w-4 h-4" /> Prioridades Clave
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <ul className="space-y-1.5">
                            {ruta.prioridades.map((p, i) => (
                                <li key={i} className="flex gap-2 items-start text-xs text-orange-800 dark:text-orange-300">
                                    <span className="w-4 h-4 rounded-full bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 flex items-center justify-center flex-shrink-0 font-bold mt-0.5 text-[10px]">{i + 1}</span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Indicadores */}
            {ruta.indicadores_de_progreso?.length > 0 && (
                <Card className="border-border shadow-none">
                    <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-violet-500" /> Indicadores de Éxito
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <ul className="space-y-1.5">
                            {ruta.indicadores_de_progreso.map((ind, i) => (
                                <li key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                                    {ind}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Próximos pasos inmediatos */}
            {ruta.proximos_pasos_inmediatos && ruta.proximos_pasos_inmediatos.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 shadow-none">
                    <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <Zap className="w-4 h-4" /> Próximos Pasos — ¡Empieza Hoy!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <ol className="space-y-2">
                            {ruta.proximos_pasos_inmediatos.map((paso, i) => (
                                <li key={i} className="flex gap-2 items-start text-xs text-amber-800 dark:text-amber-300">
                                    <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 font-bold mt-0.5 text-[10px]">{i + 1}</span>
                                    {paso}
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

