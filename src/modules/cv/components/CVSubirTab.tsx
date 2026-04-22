import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Badge } from '@/core/components/ui/badge';
import { Textarea } from '@/core/components/ui/textarea';
import {
    Upload,
    FileText,
    Sparkles,
    CheckCircle,
    Save,
    RefreshCw,
    User,
    Briefcase,
    GraduationCap,
    Award,
} from 'lucide-react';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import { toast } from 'react-toastify';

interface CVSubirTabProps {
    onCVImportado?: () => void;
}

interface CVExtraido {
    titulo_profesional: string;
    resumen_profesional: string;
    anios_experiencia: number;
    nivel_educacion: string;
    sector_profesional: string;
    habilidades: { nombre: string; categoria: string; nivel: string; anios_experiencia: number }[];
}

export const CVSubirTab = ({ onCVImportado }: CVSubirTabProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [cvExtraido, setCvExtraido] = useState<CVExtraido | null>(null);
    const [editando, setEditando] = useState<CVExtraido | null>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.docx') || dropped.name.endsWith('.doc'))) {
            setFile(dropped);
            setCvExtraido(null);
            setEditando(null);
        } else {
            toast.error('Solo se aceptan archivos PDF o Word (.doc, .docx)');
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setCvExtraido(null);
            setEditando(null);
        }
    };

    const handleExtraer = async () => {
        if (!file) {
            toast.error('Selecciona un archivo primero');
            return;
        }

        setIsExtracting(true);
        try {
            const formData = new FormData();
            formData.append('cv', file);

            // TODO: Replace with actual API endpoint
            const { data } = await bolsaEmpleoIA.post('/cv/extraer', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCvExtraido(data);
            setEditando({ ...data });
            toast.success('CV procesado exitosamente. Revisa y ajusta los datos extraídos.');
        } catch {
            toast.error('Error al procesar el archivo. Verifica que el servicio esté disponible.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleGuardar = async () => {
        if (!editando) return;

        setIsSaving(true);
        try {
            // TODO: Replace with actual API endpoint
            await bolsaEmpleoIA.post('/cv/importar', editando);
            toast.success('CV importado y guardado exitosamente en tu perfil');
            onCVImportado?.();
            setFile(null);
            setCvExtraido(null);
            setEditando(null);
        } catch {
            toast.error('Error al guardar los datos. Intenta nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setCvExtraido(null);
        setEditando(null);
    };

    return (
        <div className="space-y-6">
            {/* Header card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-white">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center shadow-md shrink-0">
                            <Upload className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Importar CV existente</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Sube tu CV en PDF o Word y la IA extraerá automáticamente tu información para cargarla en tu perfil, habilitando la validación y las rutas de aprendizaje personalizadas.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Proceso de 3 pasos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { num: '1', icon: Upload, label: 'Sube tu archivo', desc: 'PDF o Word', done: !!file },
                    { num: '2', icon: Sparkles, label: 'IA extrae los datos', desc: 'Procesamiento automático', done: !!cvExtraido },
                    { num: '3', icon: Save, label: 'Revisa y guarda', desc: 'Ajusta si es necesario', done: false },
                ].map((step) => (
                    <div key={step.num} className={`flex items-center gap-3 p-3 rounded-xl border ${step.done ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'gradient-brand' : 'bg-muted'}`}>
                            {step.done ? (
                                <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                                <span className={`text-xs font-bold ${step.done ? 'text-white' : 'text-muted-foreground'}`}>{step.num}</span>
                            )}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${step.done ? 'text-primary' : 'text-foreground'}`}>{step.label}</p>
                            <p className="text-xs text-muted-foreground">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Zona upload */}
            {!cvExtraido && (
                <>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                            isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => document.getElementById('cv-subir-input')?.click()}
                    >
                        <input
                            id="cv-subir-input"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleFileInput}
                        />
                        {file ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <FileText className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-lg">{file.name}</p>
                                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    Archivo seleccionado — haz clic para cambiar
                                </Badge>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                                    <Upload className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-lg">Arrastra tu CV aquí</p>
                                    <p className="text-sm text-muted-foreground">o haz clic para seleccionar un archivo</p>
                                </div>
                                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX — máx. 10 MB</p>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleExtraer}
                        disabled={!file || isExtracting}
                        size="lg"
                        className="w-full gradient-brand text-white shadow-lg hover:opacity-90 transition-opacity gap-2"
                    >
                        {isExtracting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Extrayendo información con IA...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Procesar CV
                            </>
                        )}
                    </Button>
                </>
            )}

            {/* Formulario con datos extraídos */}
            {cvExtraido && editando && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <h3 className="font-bold text-foreground text-lg">Datos extraídos — revisa y ajusta</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground">
                            <RefreshCw className="h-4 w-4" />
                            Subir otro
                        </Button>
                    </div>

                    {/* Info básica */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold text-foreground">Información profesional</h4>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Título profesional</Label>
                                <Input
                                    value={editando.titulo_profesional}
                                    onChange={(e) => setEditando({ ...editando, titulo_profesional: e.target.value })}
                                    placeholder="ej. Desarrollador Full Stack"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Años de experiencia</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={editando.anios_experiencia}
                                    onChange={(e) => setEditando({ ...editando, anios_experiencia: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nivel de educación</Label>
                                <Input
                                    value={editando.nivel_educacion}
                                    onChange={(e) => setEditando({ ...editando, nivel_educacion: e.target.value })}
                                    placeholder="ej. Licenciatura, Maestría"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sector profesional</Label>
                                <Input
                                    value={editando.sector_profesional}
                                    onChange={(e) => setEditando({ ...editando, sector_profesional: e.target.value })}
                                    placeholder="ej. Tecnología, Finanzas"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Resumen profesional</Label>
                                <Textarea
                                    rows={4}
                                    value={editando.resumen_profesional}
                                    onChange={(e) => setEditando({ ...editando, resumen_profesional: e.target.value })}
                                    placeholder="Describe tu perfil profesional..."
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Habilidades extraídas */}
                    {editando.habilidades.length > 0 && (
                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-purple-500" />
                                    <h4 className="font-semibold text-foreground">
                                        Habilidades detectadas
                                    </h4>
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                        {editando.habilidades.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {editando.habilidades.map((h, i) => (
                                        <Badge key={i} variant="secondary" className="gap-1 py-1 px-3">
                                            <span>{h.nombre}</span>
                                            <span className="text-muted-foreground">· {h.nivel}</span>
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="flex-1 gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGuardar}
                            disabled={isSaving}
                            size="lg"
                            className="flex-1 gradient-brand text-white shadow-md hover:opacity-90 transition-opacity gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Importar a mi perfil
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Al importar, los datos se guardarán en tu CV y podrás usarlos para la validación y rutas de aprendizaje personalizadas.
                    </p>
                </div>
            )}
        </div>
    );
};
