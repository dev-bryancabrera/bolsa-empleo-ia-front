import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/modules/auth/services/AuthService';
import { UserService } from '@/modules/users/services/UserService';
import { CVService } from '@/modules/cv/services/CVService';
import {
    Eye, EyeOff, Save, Sparkles, Globe, ExternalLink, Loader2,
    Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Link, Palette,
    Layout, FileText, Settings, Image, Upload, X, Monitor, Smartphone
} from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { Switch } from '@/core/components/ui/switch';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PortfolioService } from '../services/PortfolioService';
import { PortfolioOptimizarModal } from '../components/PortfolioOptimizarModal';
import { MinimalistaTemplate } from '../templates/MinimalistaTemplate';
import { ProfesionalTemplate } from '../templates/ProfesionalTemplate';
import { CreativoTemplate } from '../templates/CreativoTemplate';
import type {
    PortfolioData, ConfiguracionPortfolio, ContenidoExtra,
    Plantilla, ColoresPortfolio, ProyectoCustom, OptimizacionPortfolioResultado,
    PersonaPublica, CVPublico, ExperienciaPublica, EducacionPublica,
    HabilidadPublica, IdiomaPublico, CertificacionPublica, PortfolioEditorData,
    TipoFondoHero, AlturaHero
} from '../types/PortfolioTypes';

const PLANTILLAS: { value: Plantilla; label: string; desc: string; emoji: string }[] = [
    { value: 'minimalista', label: 'Minimalista', desc: 'Limpio y elegante con hero a dos columnas', emoji: '◻' },
    { value: 'profesional', label: 'Profesional', desc: 'Nav oscura, hero dividido y sidebar de skills', emoji: '◼' },
    { value: 'creativo', label: 'Creativo', desc: 'Hero a pantalla completa con tipografía bold', emoji: '◈' },
];

const FUENTES = [
    { value: 'inter', label: 'Inter', style: "'Inter', system-ui, sans-serif" },
    { value: 'poppins', label: 'Poppins', style: "'Poppins', 'Segoe UI', sans-serif" },
    { value: 'playfair', label: 'Playfair', style: "'Playfair Display', Georgia, serif" },
    { value: 'roboto', label: 'Roboto', style: "'Roboto', system-ui, Arial, sans-serif" },
];

const SECCIONES_LABELS: Record<string, string> = {
    resumen: 'Sobre mí / Resumen',
    experiencia: 'Experiencia laboral',
    educacion: 'Educación',
    habilidades: 'Habilidades',
    idiomas: 'Idiomas',
    certificaciones: 'Certificaciones',
    proyectos_custom: 'Proyectos',
    contacto: 'Contacto',
};

const COLORES_PRESET: ColoresPortfolio[] = [
    { primario: '#6d28d9', secundario: '#2563eb', fondo: '#ffffff', texto: '#111827', acento: '#8b5cf6' },
    { primario: '#059669', secundario: '#0891b2', fondo: '#ffffff', texto: '#111827', acento: '#10b981' },
    { primario: '#dc2626', secundario: '#ea580c', fondo: '#ffffff', texto: '#111827', acento: '#f97316' },
    { primario: '#1e40af', secundario: '#1d4ed8', fondo: '#f8fafc', texto: '#0f172a', acento: '#3b82f6' },
    { primario: '#7c3aed', secundario: '#a855f7', fondo: '#0f0f14', texto: '#f8fafc', acento: '#c084fc' },
    { primario: '#0d9488', secundario: '#0891b2', fondo: '#0f172a', texto: '#f1f5f9', acento: '#14b8a6' },
];

const GRADIENTES_PRESET = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const DUMMY_PERSONA: PersonaPublica = { id: 0, nombre: 'Tu', apellido: 'Nombre', ciudad: 'Ciudad', pais: 'Ecuador' };
const DUMMY_CV: CVPublico = { id: 0, titulo_profesional: 'Tu Título Profesional', resumen_profesional: 'Tu resumen profesional aparecerá aquí una vez que hayas completado tu CV.' };

async function comprimirImagen(file: File, maxW: number, maxH: number, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new window.Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target!.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const PortfolioEditorPage = () => {
    const authUser = useAuthStore(state => state.user);
    const navigate = useNavigate();
    const [tieneCV, setTieneCV] = useState<boolean | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

    const [previewPersona, setPreviewPersona] = useState<PersonaPublica>(DUMMY_PERSONA);
    const [previewCV, setPreviewCV] = useState<CVPublico>(DUMMY_CV);
    const [previewExp, setPreviewExp] = useState<ExperienciaPublica[]>([]);
    const [previewEdu, setPreviewEdu] = useState<EducacionPublica[]>([]);
    const [previewHab, setPreviewHab] = useState<HabilidadPublica[]>([]);
    const [previewIdi, setPreviewIdi] = useState<IdiomaPublico[]>([]);
    const [previewCert, setPreviewCert] = useState<CertificacionPublica[]>([]);

    const [config, setConfig] = useState<ConfiguracionPortfolio | null>(null);
    const [contenido, setContenido] = useState<ContenidoExtra | null>(null);
    const [plantilla, setPlantilla] = useState<Plantilla>('minimalista');
    const [publicado, setPublicado] = useState(false);
    const [slug, setSlug] = useState('');
    const [slugEdit, setSlugEdit] = useState(false);
    const [togglingPublicado, setTogglingPublicado] = useState(false);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [optimizarOpen, setOptimizarOpen] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [optimizacionResultado, setOptimizacionResultado] = useState<OptimizacionPortfolioResultado | null>(null);

    const perfilInputRef = useRef<HTMLInputElement>(null);
    const fondoInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPerfil, setUploadingPerfil] = useState(false);
    const [uploadingFondo, setUploadingFondo] = useState(false);

    useEffect(() => { loadPortfolio(); }, []);

    const applyEditorData = (ed: PortfolioEditorData) => {
        setPreviewPersona(ed.persona);
        if (ed.cv) setPreviewCV(ed.cv);
        setPreviewExp(ed.experiencias);
        setPreviewEdu(ed.educaciones);
        setPreviewHab(ed.habilidades);
        setPreviewIdi(ed.idiomas);
        setPreviewCert(ed.certificaciones);
    };

    const loadPortfolio = async () => {
        setLoading(true);
        try {
            // CV guard: check if user has a CV before showing the portfolio editor
            if (authUser?.id) {
                try {
                    const userData = await UserService.obtenerPersonaPorUsuario(authUser.id);
                    if (userData?.persona?.id) {
                        await CVService.obtenerCVPorPersona(userData.persona.id);
                        setTieneCV(true);
                    } else {
                        setTieneCV(false);
                        return;
                    }
                } catch {
                    setTieneCV(false);
                    return;
                }
            }

            let p: PortfolioData;
            try {
                p = await PortfolioService.obtener();
            } catch (err: unknown) {
                const axiosErr = err as { response?: { status?: number } };
                if (axiosErr?.response?.status === 404) {
                    p = await PortfolioService.crear();
                } else throw err;
            }
            setPortfolio(p);
            setConfig(p.configuracion);
            setContenido(p.contenido_extra);
            setPlantilla(p.plantilla);
            setPublicado(p.publicado);
            setSlug(p.url_slug);
            PortfolioService.obtenerDatosEditor().then(applyEditorData).catch(() => {});
        } catch {
            toast.error('Error al cargar el portafolio');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublicado = async (value: boolean) => {
        setPublicado(value);
        setTogglingPublicado(true);
        try {
            await PortfolioService.actualizar({ publicado: value });
            toast.success(value ? 'Portafolio publicado' : 'Portafolio despublicado');
        } catch {
            setPublicado(!value);
            toast.error('Error al cambiar el estado');
        } finally {
            setTogglingPublicado(false);
        }
    };

    const handleSave = async () => {
        if (!config || !contenido) return;
        setSaving(true);
        try {
            const updated = await PortfolioService.actualizar({
                plantilla, publicado, url_slug: slug, configuracion: config, contenido_extra: contenido,
            });
            setPortfolio(updated);
            setHasUnsavedChanges(false);
            toast.success('Portafolio guardado');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            toast.error(axiosErr?.response?.data?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleOptimizar = async () => {
        setOptimizacionResultado(null);
        setIsOptimizing(true);
        setOptimizarOpen(true);
        try {
            const r = await PortfolioService.optimizar();
            setOptimizacionResultado(r);
        } catch {
            toast.error('Error al optimizar. Intenta nuevamente.');
            setOptimizarOpen(false);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleAplicarOptimizacion = async (resultado: OptimizacionPortfolioResultado) => {
        if (!contenido || !config) return;
        setIsApplying(true);
        try {
            const nuevoContenido: ContenidoExtra = {
                ...contenido,
                titulo_hero: resultado.titulo_hero_mejorado || contenido.titulo_hero,
                bio_extendida: resultado.bio_extendida_mejorada || contenido.bio_extendida,
                frase_motivacional: resultado.frase_motivacional_mejorada || contenido.frase_motivacional,
            };
            const nuevaConfig: ConfiguracionPortfolio = {
                ...config,
                secciones: resultado.secciones_recomendadas || config.secciones,
                orden_secciones: resultado.orden_secciones_recomendado || config.orden_secciones,
            };
            const nuevoPlantilla = resultado.plantilla_recomendada || plantilla;
            const updated = await PortfolioService.actualizar({
                plantilla: nuevoPlantilla, configuracion: nuevaConfig, contenido_extra: nuevoContenido,
            });
            setPortfolio(updated);
            setContenido(nuevoContenido);
            setConfig(nuevaConfig);
            setPlantilla(nuevoPlantilla);
            setOptimizarOpen(false);
            setOptimizacionResultado(null);
            toast.success('¡Portafolio optimizado con IA!');
        } catch {
            toast.error('Error al aplicar mejoras');
        } finally {
            setIsApplying(false);
        }
    };

    const updateConfig = useCallback(<K extends keyof ConfiguracionPortfolio>(key: K, value: ConfiguracionPortfolio[K]) => {
        setConfig(prev => prev ? { ...prev, [key]: value } : prev);
        setHasUnsavedChanges(true);
    }, []);

    const updateContenido = useCallback(<K extends keyof ContenidoExtra>(key: K, value: ContenidoExtra[K]) => {
        setContenido(prev => prev ? { ...prev, [key]: value } : prev);
        setHasUnsavedChanges(true);
    }, []);

    const addProyecto = () => {
        const nuevo: ProyectoCustom = { id: generateId(), nombre: 'Nuevo Proyecto', descripcion: '', tecnologias: [], url: '', imagen_url: '', destacado: false };
        updateContenido('proyectos_custom', [...(contenido?.proyectos_custom || []), nuevo]);
    };

    const updateProyecto = (id: string, field: keyof ProyectoCustom, value: unknown) => {
        updateContenido('proyectos_custom', (contenido?.proyectos_custom || []).map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removeProyecto = (id: string) => {
        updateContenido('proyectos_custom', (contenido?.proyectos_custom || []).filter(p => p.id !== id));
    };

    const moveSeccion = (index: number, dir: -1 | 1) => {
        if (!config) return;
        const arr = [...config.orden_secciones];
        const newIdx = index + dir;
        if (newIdx < 0 || newIdx >= arr.length) return;
        [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
        updateConfig('orden_secciones', arr);
    };

    const handleUploadPerfil = async (file: File) => {
        setUploadingPerfil(true);
        try {
            const dataUrl = await comprimirImagen(file, 600, 600, 0.9);
            updateContenido('imagen_perfil_url', dataUrl);
        } catch { toast.error('Error al procesar la imagen'); }
        finally { setUploadingPerfil(false); }
    };

    const handleUploadFondo = async (file: File) => {
        setUploadingFondo(true);
        try {
            const dataUrl = await comprimirImagen(file, 1920, 1080, 0.85);
            updateContenido('imagen_fondo_hero_url', dataUrl);
        } catch { toast.error('Error al procesar la imagen'); }
        finally { setUploadingFondo(false); }
    };

    if (loading || tieneCV === null) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
    );

    if (tieneCV === false) return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Globe className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Tu portafolio te espera</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                    Para crear tu portafolio web necesitas tener tu CV registrado.
                    Con esa información construimos tu página profesional automáticamente.
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/dashboard/cv')}
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2 shadow-lg"
                    >
                        <Sparkles className="w-4 h-4" />
                        Crear mi CV para activar el portafolio
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                        Volver al dashboard
                    </Button>
                </div>
            </div>
        </div>
    );

    if (!config || !contenido) return null;

    const previewProps = {
        persona: previewPersona, cv: previewCV, config, contenido,
        experiencias: previewExp, educaciones: previewEdu,
        habilidades: previewHab, idiomas: previewIdi, certificaciones: previewCert,
    };

    const publicUrl = `/p/${slug}`;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* ── Panel editor ─────────────────────────── */}
            <div className="w-[420px] shrink-0 border-r flex flex-col bg-background overflow-y-auto">

                {/* Toolbar */}
                <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 cursor-pointer bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleOptimizar} className="gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                            IA
                        </Button>
                        <div className="flex-1" />
                        <Button size="sm" variant="ghost" onClick={() => setShowPreview(v => !v)} className="gap-1.5">
                            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showPreview ? 'Ocultar' : 'Preview'}
                        </Button>
                    </div>
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Tienes cambios sin guardar — presiona Guardar</span>
                        </div>
                    )}
                </div>

                {/* Publicar / URL */}
                <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Estado</Label>
                        <div className="flex items-center gap-2">
                            <Switch checked={publicado} onCheckedChange={handleTogglePublicado} disabled={togglingPublicado} />
                            <span className={cn('text-xs font-medium', publicado ? 'text-green-600' : 'text-muted-foreground')}>
                                {togglingPublicado ? '...' : publicado ? 'Publicado' : 'Borrador'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {slugEdit ? (
                            <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                className="h-7 text-xs flex-1" onBlur={() => setSlugEdit(false)} autoFocus />
                        ) : (
                            <span className="text-xs text-muted-foreground flex-1 truncate">
                                <Globe className="h-3 w-3 inline mr-1" />/p/{slug}
                            </span>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setSlugEdit(v => !v)}>
                            <Link className="h-3 w-3" />
                        </Button>
                        {publicado && (
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" asChild>
                                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs editor */}
                <Tabs defaultValue="diseno" className="flex-1">
                    <TabsList className="w-full rounded-none border-b h-10 bg-background px-2 justify-start gap-0.5">
                        <TabsTrigger value="diseno" className="text-xs gap-1.5 h-8 px-2.5"><Palette className="h-3.5 w-3.5" />Diseño</TabsTrigger>
                        <TabsTrigger value="imagenes" className="text-xs gap-1.5 h-8 px-2.5"><Image className="h-3.5 w-3.5" />Imágenes</TabsTrigger>
                        <TabsTrigger value="contenido" className="text-xs gap-1.5 h-8 px-2.5"><FileText className="h-3.5 w-3.5" />Contenido</TabsTrigger>
                        <TabsTrigger value="secciones" className="text-xs gap-1.5 h-8 px-2.5"><Settings className="h-3.5 w-3.5" />Secciones</TabsTrigger>
                    </TabsList>

                    {/* ── TAB: Diseño ── */}
                    <TabsContent value="diseno" className="p-4 space-y-6 mt-0">

                        {/* Plantilla */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Plantilla</Label>
                            <div className="space-y-2">
                                {PLANTILLAS.map(p => (
                                    <button key={p.value} onClick={() => { setPlantilla(p.value); setHasUnsavedChanges(true); }}
                                        className={cn('w-full text-left p-3 rounded-lg border transition-all', plantilla === p.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-border hover:border-violet-300')}>
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">{p.emoji}</span>
                                            <div>
                                                <p className="text-sm font-semibold">{p.label}</p>
                                                <p className="text-xs text-muted-foreground">{p.desc}</p>
                                            </div>
                                            {plantilla === p.value && <div className="ml-auto w-2 h-2 rounded-full bg-violet-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hero fondo */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Fondo del Hero</Label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {(['color', 'gradiente', 'imagen'] as TipoFondoHero[]).map(t => (
                                    <button key={t} onClick={() => updateConfig('tipo_fondo_hero', t)}
                                        className={cn('py-2 px-1 rounded-lg border text-xs font-medium capitalize transition-all', (config.tipo_fondo_hero ?? 'color') === t ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400' : 'border-border hover:border-violet-300')}>
                                        {t === 'color' ? 'Color' : t === 'gradiente' ? 'Gradiente' : 'Imagen'}
                                    </button>
                                ))}
                            </div>

                            {/* Gradient presets */}
                            {config.tipo_fondo_hero === 'gradiente' && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Gradientes predefinidos</p>
                                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                                        {GRADIENTES_PRESET.map((g, i) => (
                                            <button key={i} onClick={() => updateConfig('gradiente_hero', g)}
                                                className={cn('h-9 rounded-lg border-2 transition-all', config.gradiente_hero === g ? 'border-violet-500 scale-105' : 'border-transparent hover:scale-105')}
                                                style={{ background: g }} />
                                        ))}
                                    </div>
                                    <Input placeholder="CSS gradient personalizado..." value={config.gradiente_hero || ''}
                                        onChange={e => updateConfig('gradiente_hero', e.target.value)}
                                        className="h-7 text-xs" />
                                </div>
                            )}

                            {/* Image overlay opacity */}
                            {config.tipo_fondo_hero === 'imagen' && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">Oscuridad del overlay</p>
                                        <span className="text-xs font-mono">{Math.round((config.hero_overlay_opacidad ?? 0.45) * 100)}%</span>
                                    </div>
                                    <input type="range" min={0} max={0.9} step={0.05}
                                        value={config.hero_overlay_opacidad ?? 0.45}
                                        onChange={e => updateConfig('hero_overlay_opacidad', parseFloat(e.target.value))}
                                        className="w-full accent-violet-600" />
                                </div>
                            )}
                        </div>

                        {/* Altura del hero */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Altura del Hero</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {([['pantalla', 'Pantalla'], ['media', 'Media'], ['compacta', 'Compacta']] as [AlturaHero, string][]).map(([v, l]) => (
                                    <button key={v} onClick={() => updateConfig('altura_hero', v)}
                                        className={cn('py-2 text-xs font-medium rounded-lg border transition-all', (config.altura_hero ?? 'media') === v ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400' : 'border-border hover:border-violet-300')}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colores */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Paleta de colores</Label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {COLORES_PRESET.map((c, i) => (
                                    <button key={i} onClick={() => updateConfig('colores', c)}
                                        className={cn('h-10 rounded-lg flex items-center justify-center border-2 transition-all', JSON.stringify(config.colores) === JSON.stringify(c) ? 'border-violet-500 scale-105' : 'border-transparent hover:scale-105')}
                                        style={{ background: `linear-gradient(135deg, ${c.primario}, ${c.secundario})` }}>
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.fondo, border: '2px solid rgba(255,255,255,0.5)' }} />
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(['primario', 'secundario', 'fondo', 'texto', 'acento'] as (keyof ColoresPortfolio)[]).map(key => (
                                    <div key={key} className="flex items-center gap-2">
                                        <input type="color" value={config.colores[key]}
                                            onChange={e => updateConfig('colores', { ...config.colores, [key]: e.target.value })}
                                            className="w-8 h-8 rounded cursor-pointer border border-border p-0.5 bg-transparent" />
                                        <span className="text-xs text-muted-foreground capitalize">{key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fuente */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Tipografía</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {FUENTES.map(f => (
                                    <button key={f.value} onClick={() => updateConfig('fuente', f.value as typeof config.fuente)}
                                        className={cn('py-2.5 px-3 rounded-lg border text-sm transition-all', config.fuente === f.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400' : 'border-border hover:border-violet-300')}
                                        style={{ fontFamily: f.style }}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navegación */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block">Navegación</Label>
                            <div className="flex items-center gap-3">
                                <Switch checked={config.mostrar_navegacion !== false}
                                    onCheckedChange={v => updateConfig('mostrar_navegacion', v)} />
                                <Label className="text-sm">Mostrar barra de navegación</Label>
                            </div>
                            {config.mostrar_navegacion !== false && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Nombre en la nav (logo)</Label>
                                    <Input placeholder={`${previewPersona.nombre} ${previewPersona.apellido}`}
                                        value={contenido.nombre_nav || ''}
                                        onChange={e => updateContenido('nombre_nav', e.target.value)}
                                        className="h-8 text-xs" />
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── TAB: Imágenes ── */}
                    <TabsContent value="imagenes" className="p-4 space-y-6 mt-0">

                        {/* Foto de perfil */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Foto de perfil</Label>
                            <div className="flex gap-3 items-start">
                                {contenido.imagen_perfil_url ? (
                                    <div className="relative shrink-0">
                                        <img src={contenido.imagen_perfil_url} alt="Perfil"
                                            className="w-20 h-20 rounded-full object-cover border-2 border-violet-400" />
                                        <button onClick={() => updateContenido('imagen_perfil_url', undefined)}
                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-muted-foreground/40 flex items-center justify-center shrink-0">
                                        <Upload className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <input ref={perfilInputRef} type="file" accept="image/*" className="hidden"
                                        onChange={e => e.target.files?.[0] && handleUploadPerfil(e.target.files[0])} />
                                    <Button size="sm" variant="outline" className="w-full gap-2 h-8 text-xs"
                                        onClick={() => perfilInputRef.current?.click()} disabled={uploadingPerfil}>
                                        {uploadingPerfil ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                        {uploadingPerfil ? 'Procesando...' : 'Subir foto'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">O pega una URL:</p>
                                    <Input placeholder="https://..." value={contenido.imagen_perfil_url || ''}
                                        onChange={e => updateContenido('imagen_perfil_url', e.target.value || undefined)}
                                        className="h-7 text-xs" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 opacity-75">Recomendado: cuadrada, al menos 400×400px</p>
                        </div>

                        {/* Imagen de fondo del hero */}
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Imagen de fondo (Hero)</Label>
                            {contenido.imagen_fondo_hero_url ? (
                                <div className="relative mb-3">
                                    <img src={contenido.imagen_fondo_hero_url} alt="Fondo hero"
                                        className="w-full h-28 rounded-lg object-cover border border-border" />
                                    <button onClick={() => updateContenido('imagen_fondo_hero_url', undefined)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-24 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center mb-3 gap-1">
                                    <Image className="h-6 w-6 text-muted-foreground/40" />
                                    <p className="text-xs text-muted-foreground/60">Sin imagen de fondo</p>
                                </div>
                            )}
                            <input ref={fondoInputRef} type="file" accept="image/*" className="hidden"
                                onChange={e => e.target.files?.[0] && handleUploadFondo(e.target.files[0])} />
                            <Button size="sm" variant="outline" className="w-full gap-2 h-8 text-xs mb-2"
                                onClick={() => fondoInputRef.current?.click()} disabled={uploadingFondo}>
                                {uploadingFondo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                {uploadingFondo ? 'Procesando...' : 'Subir imagen de fondo'}
                            </Button>
                            <Input placeholder="https://... (URL de imagen)" value={contenido.imagen_fondo_hero_url || ''}
                                onChange={e => updateContenido('imagen_fondo_hero_url', e.target.value || undefined)}
                                className="h-7 text-xs" />
                            {contenido.imagen_fondo_hero_url && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5 rounded">
                                    Activa "Imagen" en Fondo del Hero (pestaña Diseño) para verla
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2 opacity-75">Recomendado: 1920×1080px o mayor</p>
                        </div>

                        {/* Imágenes de proyectos */}
                        {contenido.proyectos_custom.length > 0 && (
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Imágenes de proyectos</Label>
                                <div className="space-y-3">
                                    {contenido.proyectos_custom.map(p => (
                                        <div key={p.id} className="border rounded-lg p-3 space-y-2">
                                            <p className="text-xs font-semibold truncate">{p.nombre}</p>
                                            {p.imagen_url && (
                                                <img src={p.imagen_url} alt={p.nombre} className="w-full h-20 rounded object-cover border border-border" />
                                            )}
                                            <Input placeholder="URL de imagen del proyecto..." value={p.imagen_url || ''}
                                                onChange={e => updateProyecto(p.id, 'imagen_url', e.target.value)}
                                                className="h-7 text-xs" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {contenido.proyectos_custom.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4 opacity-60">
                                Agrega proyectos desde la pestaña Contenido para gestionar sus imágenes aquí
                            </p>
                        )}
                    </TabsContent>

                    {/* ── TAB: Contenido ── */}
                    <TabsContent value="contenido" className="p-4 space-y-5 mt-0">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Título / Subtítulo Hero</Label>
                            <Input placeholder="ej: Full Stack Developer apasionado por el impacto" value={contenido.titulo_hero}
                                onChange={e => updateContenido('titulo_hero', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Frase motivacional</Label>
                            <Input placeholder="ej: Transformando ideas en soluciones digitales" value={contenido.frase_motivacional}
                                onChange={e => updateContenido('frase_motivacional', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Bio extendida (Sobre mí)</Label>
                            <Textarea placeholder="Cuéntate con más detalle: tu pasión, tus logros, tu propuesta de valor..." rows={4}
                                value={contenido.bio_extendida} onChange={e => updateContenido('bio_extendida', e.target.value)} className="text-sm resize-none" />
                        </div>

                        <div className="flex items-center gap-3 py-1">
                            <Switch checked={contenido.disponible_para_trabajo} onCheckedChange={v => updateContenido('disponible_para_trabajo', v)} />
                            <Label className="text-sm">Disponible para nuevas oportunidades</Label>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email de contacto</Label>
                            <Input placeholder="tu@email.com" type="email" value={contenido.email_contacto || ''}
                                onChange={e => updateContenido('email_contacto', e.target.value || undefined)}
                                className="h-8 text-xs" />
                            <p className="text-xs text-muted-foreground opacity-70">Se usa en el formulario de contacto del portafolio</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links sociales</Label>
                            {(['linkedin', 'github', 'twitter', 'website'] as const).map(key => (
                                <div key={key} className="flex items-center gap-2">
                                    <span className="text-xs w-16 text-muted-foreground capitalize">{key}</span>
                                    <Input placeholder={`https://`} value={contenido.links_sociales[key] || ''}
                                        onChange={e => updateContenido('links_sociales', { ...contenido.links_sociales, [key]: e.target.value })}
                                        className="flex-1 h-8 text-xs" />
                                </div>
                            ))}
                        </div>

                        {/* Proyectos */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proyectos</Label>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addProyecto}>
                                    <Plus className="h-3 w-3" />Agregar
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {contenido.proyectos_custom.map(p => (
                                    <div key={p.id} className="border rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input placeholder="Nombre del proyecto" value={p.nombre}
                                                onChange={e => updateProyecto(p.id, 'nombre', e.target.value)} className="flex-1 h-7 text-xs" />
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeProyecto(p.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <Textarea placeholder="Descripción e impacto del proyecto..." rows={2} value={p.descripcion}
                                            onChange={e => updateProyecto(p.id, 'descripcion', e.target.value)} className="text-xs resize-none" />
                                        <Input placeholder="Tecnologías: React, Node, MySQL..." value={p.tecnologias.join(', ')}
                                            onChange={e => updateProyecto(p.id, 'tecnologias', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                            className="h-7 text-xs" />
                                        <Input placeholder="URL del proyecto (opcional)" value={p.url || ''}
                                            onChange={e => updateProyecto(p.id, 'url', e.target.value)} className="h-7 text-xs" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── TAB: Secciones ── */}
                    <TabsContent value="secciones" className="p-4 mt-0">
                        <p className="text-xs text-muted-foreground mb-4">Activa, desactiva y reordena las secciones de tu portafolio.</p>
                        <div className="space-y-2">
                            {config.orden_secciones.map((key, idx) => (
                                <div key={key} className="flex items-center gap-2 p-2.5 rounded-lg border bg-card">
                                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm flex-1">{SECCIONES_LABELS[key] || key}</span>
                                    <div className="flex gap-0.5">
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveSeccion(idx, -1)} disabled={idx === 0}>
                                            <ChevronUp className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveSeccion(idx, 1)} disabled={idx === config.orden_secciones.length - 1}>
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <Switch checked={config.secciones[key as keyof typeof config.secciones] ?? true}
                                        onCheckedChange={v => updateConfig('secciones', { ...config.secciones, [key]: v })} />
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Panel preview ─────────────────────────── */}
            {showPreview && (
                <div className="flex-1 bg-muted/30 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-2 border-b bg-background">
                        <div className="flex rounded-lg border overflow-hidden">
                            <button onClick={() => setPreviewTab('desktop')}
                                className={cn('px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5', previewTab === 'desktop' ? 'bg-violet-600 text-white' : 'bg-background hover:bg-muted')}>
                                <Monitor className="h-3.5 w-3.5" />Desktop
                            </button>
                            <button onClick={() => setPreviewTab('mobile')}
                                className={cn('px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5', previewTab === 'mobile' ? 'bg-violet-600 text-white' : 'bg-background hover:bg-muted')}>
                                <Smartphone className="h-3.5 w-3.5" />Mobile
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Vista previa en tiempo real</p>
                        {publicado && (
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                                className="ml-auto flex items-center gap-1.5 text-xs text-violet-600 hover:underline">
                                <ExternalLink className="h-3 w-3" />Ver publicado
                            </a>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        <div className={cn('bg-white shadow-2xl rounded-lg overflow-hidden transition-all mx-auto', previewTab === 'mobile' ? 'w-[390px]' : 'w-full max-w-5xl')}
                            style={{ zoom: previewTab === 'desktop' ? '0.82' : '0.75' }}>
                            {plantilla === 'profesional' && <ProfesionalTemplate {...previewProps} />}
                            {plantilla === 'creativo' && <CreativoTemplate {...previewProps} />}
                            {(!plantilla || plantilla === 'minimalista') && <MinimalistaTemplate {...previewProps} />}
                        </div>
                    </div>
                </div>
            )}

            <PortfolioOptimizarModal
                open={optimizarOpen}
                onOpenChange={setOptimizarOpen}
                isLoading={isOptimizing}
                resultado={optimizacionResultado}
                onAplicar={handleAplicarOptimizacion}
                isApplying={isApplying}
            />
        </div>
    );
};
