import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Badge } from '@/core/components/ui/badge';
import {
    Link2,
    Sparkles,
    CheckCircle,
    XCircle,
    TrendingUp,
    Briefcase,
    Target,
    AlertTriangle,
} from 'lucide-react';
import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import { toast } from 'react-toastify';

interface CVCompatibilidadTabProps {
    cvData: any;
}

interface ResultadoCompatibilidad {
    puntuacion: number;
    nivel: 'alta' | 'media' | 'baja';
    puesto: string;
    empresa: string;
    habilidades_match: string[];
    habilidades_faltantes: string[];
    requisitos_match: string[];
    requisitos_faltantes: string[];
    recomendaciones: string[];
    resumen: string;
}

const nivelConfig = {
    alta: { label: 'Alta compatibilidad', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', barColor: 'bg-green-500' },
    media: { label: 'Compatibilidad media', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', barColor: 'bg-yellow-500' },
    baja: { label: 'Baja compatibilidad', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', barColor: 'bg-red-500' },
};

export const CVCompatibilidadTab = ({ cvData }: CVCompatibilidadTabProps) => {
    const [url, setUrl] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [resultado, setResultado] = useState<ResultadoCompatibilidad | null>(null);

    const isValidUrl = (value: string) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    };

    const handleVerificar = async () => {
        if (!url.trim()) {
            toast.error('Ingresa la URL de la vacante');
            return;
        }
        if (!isValidUrl(url)) {
            toast.error('La URL ingresada no es válida');
            return;
        }
        if (!cvData) {
            toast.error('Necesitas tener un CV creado para verificar compatibilidad');
            return;
        }

        setIsChecking(true);
        try {
            // TODO: Replace with actual API endpoint
            const { data } = await bolsaEmpleoIA.post('/cv/compatibilidad', {
                cv_id: cvData.id,
                url_vacante: url,
            });
            setResultado(data);
        } catch {
            toast.error('Error al verificar compatibilidad. Verifica que el servicio esté disponible.');
        } finally {
            setIsChecking(false);
        }
    };

    const nivel = resultado ? nivelConfig[resultado.nivel] : null;

    return (
        <div className="space-y-6">
            {/* Header card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center shadow-md shrink-0">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Compatibilidad con Vacantes</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Pega el enlace de cualquier oferta laboral y la IA analizará qué tan compatible es tu perfil con los requisitos del puesto.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Input URL */}
            <Card className="border-0 shadow-md">
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url-vacante" className="font-semibold text-foreground">
                            URL de la vacante
                        </Label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="url-vacante"
                                    type="url"
                                    placeholder="https://www.linkedin.com/jobs/view/..."
                                    className="pl-10"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerificar()}
                                />
                            </div>
                            <Button
                                onClick={handleVerificar}
                                disabled={isChecking || !url.trim()}
                                className="gradient-brand text-white shadow-md hover:opacity-90 transition-opacity gap-2 shrink-0"
                            >
                                {isChecking ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Analizando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Verificar
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Soporta LinkedIn, Indeed, Computrabajo, InfoJobs y otras plataformas de empleo.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Estado sin CV */}
            {!cvData && (
                <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50/50">
                    <CardContent className="py-8 text-center">
                        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                        <p className="font-semibold text-foreground mb-1">Necesitas un CV creado</p>
                        <p className="text-sm text-muted-foreground">
                            Ve a la pestaña <strong>Mi CV</strong> para crear tu perfil profesional antes de verificar compatibilidades.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Resultados */}
            {resultado && nivel && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Score principal */}
                    <Card className={`border-2 ${nivel.border} ${nivel.bg}`}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="text-center md:text-left">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Compatibilidad</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-start">
                                        <span className={`text-5xl font-black ${nivel.color}`}>{resultado.puntuacion}</span>
                                        <span className={`text-xl font-semibold ${nivel.color}`}>%</span>
                                    </div>
                                    <Badge className={`mt-2 ${nivel.color} ${nivel.bg} border ${nivel.border}`}>
                                        {nivel.label}
                                    </Badge>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <p className="font-semibold text-foreground">{resultado.puesto}</p>
                                    </div>
                                    {resultado.empresa && (
                                        <p className="text-sm text-muted-foreground pl-6">{resultado.empresa}</p>
                                    )}
                                    <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${nivel.barColor}`}
                                            style={{ width: `${resultado.puntuacion}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {resultado.resumen && (
                                <p className="mt-4 text-sm text-foreground bg-white/70 rounded-lg p-3 border border-border/50">
                                    {resultado.resumen}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Habilidades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <h3 className="font-bold text-foreground">Habilidades que tienes</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {resultado.habilidades_match.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {resultado.habilidades_match.map((h, i) => (
                                            <Badge key={i} className="bg-green-100 text-green-700 border-green-200">
                                                {h}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No se encontraron coincidencias</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <h3 className="font-bold text-foreground">Habilidades que te faltan</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {resultado.habilidades_faltantes.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {resultado.habilidades_faltantes.map((h, i) => (
                                            <Badge key={i} className="bg-red-100 text-red-700 border-red-200">
                                                {h}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-green-600 font-medium">
                                        ¡Cumples con todas las habilidades requeridas!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Requisitos */}
                    {(resultado.requisitos_match.length > 0 || resultado.requisitos_faltantes.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <h3 className="font-bold text-foreground">Requisitos que cumples</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {resultado.requisitos_match.map((r, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                            {r}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <h3 className="font-bold text-foreground">Requisitos pendientes</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {resultado.requisitos_faltantes.map((r, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                            {r}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    {resultado.recomendaciones.length > 0 && (
                        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-white">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <h3 className="font-bold text-foreground">Cómo mejorar tu candidatura</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {resultado.recomendaciones.map((r, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-foreground leading-relaxed">{r}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};
