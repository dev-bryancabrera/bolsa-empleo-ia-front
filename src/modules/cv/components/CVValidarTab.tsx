import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import {
    FileCheck,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Sparkles,
    Upload,
    FileText,
    Lightbulb,
} from 'lucide-react';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import { toast } from 'react-toastify';

interface CVValidarTabProps {
    cvData: any;
}

interface SeccionValidacion {
    nombre: string;
    estado: 'ok' | 'warning' | 'error';
    observacion: string;
}

interface ResultadoValidacion {
    score: number;
    nivel: 'excelente' | 'bueno' | 'mejorable' | 'deficiente';
    secciones: SeccionValidacion[];
    sugerencias: string[];
}

const nivelConfig = {
    excelente: { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-400' },
    bueno: { label: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-400' },
    mejorable: { label: 'Mejorable', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-400' },
    deficiente: { label: 'Deficiente', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-400' },
};

const estadoIcon = {
    ok: <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />,
    error: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
};

export const CVValidarTab = ({ cvData }: CVValidarTabProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [resultado, setResultado] = useState<ResultadoValidacion | null>(null);
    const [useExisting, setUseExisting] = useState(true);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.docx') || dropped.name.endsWith('.doc'))) {
            setFile(dropped);
            setUseExisting(false);
        } else {
            toast.error('Solo se aceptan archivos PDF o Word (.doc, .docx)');
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setUseExisting(false);
        }
    };

    const handleValidar = async () => {
        if (!useExisting && !file) {
            toast.error('Selecciona un archivo para validar');
            return;
        }
        if (useExisting && !cvData) {
            toast.error('Aún no tienes un CV creado. Crea tu CV primero o sube un archivo.');
            return;
        }

        setIsAnalyzing(true);
        try {
            let response;
            if (useExisting) {
                // TODO: Replace with actual API endpoint
                const { data } = await bolsaEmpleoIA.post('/cv/validar', { cv_id: cvData.id });
                response = data;
            } else {
                const formData = new FormData();
                formData.append('cv', file!);
                const { data } = await bolsaEmpleoIA.post('/cv/validar-archivo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                response = data;
            }
            setResultado(response);
        } catch {
            toast.error('Error al validar el CV. Verifica que el servicio esté disponible.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const nivel = resultado ? nivelConfig[resultado.nivel] : null;

    return (
        <div className="space-y-6">
            {/* Header card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center shadow-md shrink-0">
                            <FileCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Validador de CV con IA</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Analiza tu CV y recibe sugerencias para maximizar tus posibilidades de ser seleccionado por empresas y sistemas ATS.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fuente del CV */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setUseExisting(true)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${useExisting ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className={`h-5 w-5 ${useExisting ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold ${useExisting ? 'text-primary' : 'text-foreground'}`}>
                            Usar mi CV del perfil
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {cvData ? 'Validar el CV que ya tienes guardado' : 'No tienes un CV creado aún'}
                    </p>
                </button>

                <button
                    onClick={() => setUseExisting(false)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${!useExisting ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Upload className={`h-5 w-5 ${!useExisting ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold ${!useExisting ? 'text-primary' : 'text-foreground'}`}>
                            Subir archivo
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {file ? file.name : 'PDF o Word (.doc, .docx)'}
                    </p>
                </button>
            </div>

            {/* Zona de carga de archivo */}
            {!useExisting && (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => document.getElementById('cv-validar-input')?.click()}
                >
                    <input
                        id="cv-validar-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileInput}
                    />
                    {file ? (
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="h-10 w-10 text-primary" />
                            <p className="font-semibold text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            <Badge variant="secondary">Listo para analizar</Badge>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="font-semibold text-foreground">Arrastra tu CV aquí</p>
                            <p className="text-sm text-muted-foreground">o haz clic para seleccionar un archivo</p>
                            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX — máx. 5 MB</p>
                        </div>
                    )}
                </div>
            )}

            {/* Botón analizar */}
            <Button
                onClick={handleValidar}
                disabled={isAnalyzing}
                size="lg"
                className="w-full gradient-brand text-white shadow-lg hover:opacity-90 transition-opacity gap-2"
            >
                {isAnalyzing ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Analizando con IA...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-5 w-5" />
                        Analizar CV
                    </>
                )}
            </Button>

            {/* Resultados */}
            {resultado && nivel && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Score */}
                    <Card className={`border-2 ${nivel.border} ${nivel.bg}`}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Puntuación de tu CV</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-5xl font-black ${nivel.color}`}>{resultado.score}</span>
                                        <span className={`text-xl font-semibold ${nivel.color}`}>/100</span>
                                    </div>
                                    <Badge className={`mt-2 ${nivel.color} ${nivel.bg} border ${nivel.border}`}>
                                        {nivel.label}
                                    </Badge>
                                </div>
                                <div className="flex-1 md:max-w-xs">
                                    <p className="text-xs text-muted-foreground mb-2">Progreso hacia un CV ideal</p>
                                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${nivel.color.replace('text-', 'bg-').replace('-600', '-500')}`}
                                            style={{ width: `${resultado.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secciones */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-3">
                            <h3 className="font-bold text-foreground text-lg">Análisis por sección</h3>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {resultado.secciones.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                    {estadoIcon[s.estado]}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-foreground">{s.nombre}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{s.observacion}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Sugerencias */}
                    <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-white">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                <h3 className="font-bold text-foreground text-lg">Sugerencias de mejora</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {resultado.sugerencias.map((s, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-foreground leading-relaxed">{s}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
