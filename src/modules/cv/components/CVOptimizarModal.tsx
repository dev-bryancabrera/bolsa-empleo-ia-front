import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';
import { Button } from '@/core/components/ui/button';
import { Sparkles, CheckCircle2, TrendingUp, Loader2, X } from 'lucide-react';

interface ResumenCambio {
    campo: string;
    razon: string;
    mejora_clave: string;
}

interface TendenciaAplicada {
    tendencia: string;
    descripcion: string;
}

export interface OptimizacionResultado {
    campos_mejorados: Record<string, string>;
    resumen_cambios: ResumenCambio[];
    tendencias_aplicadas: TendenciaAplicada[];
    score_antes: number;
    score_despues: number;
    consejo_adicional: string;
}

interface CVOptimizarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading: boolean;
    resultado: OptimizacionResultado | null;
    onAplicar: () => void;
    isApplying?: boolean;
}

export const CVOptimizarModal = ({
    open,
    onOpenChange,
    isLoading,
    resultado,
    onAplicar,
    isApplying = false,
}: CVOptimizarModalProps) => {
    const mejora = resultado ? resultado.score_despues - resultado.score_antes : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 -mx-6 -mt-6 px-6 pt-6 mb-4">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div>Optimizar CV con IA</div>
                            <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                Tendencias de reclutamiento 2025-2026
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-violet-600 animate-pulse" />
                            </div>
                            <Loader2 className="h-6 w-6 text-violet-500 animate-spin absolute -top-1 -right-1" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-foreground">Analizando tu CV con IA...</p>
                            <p className="text-sm text-muted-foreground mt-1">Aplicando tendencias ATS 2025 y mercado latinoamericano</p>
                        </div>
                    </div>
                )}

                {!isLoading && resultado && (
                    <div className="space-y-5">
                        {/* Score comparison */}
                        <div className="flex items-center justify-center gap-6 bg-muted/30 rounded-xl p-4">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Score actual</p>
                                <span className="text-3xl font-bold text-muted-foreground">{resultado.score_antes}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                                <span className="text-xs font-semibold text-green-600 mt-0.5">+{mejora} pts</span>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Score estimado</p>
                                <span className="text-3xl font-bold text-green-600">{resultado.score_despues}</span>
                            </div>
                        </div>

                        {/* Cambios propuestos */}
                        {resultado.resumen_cambios.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Mejoras propuestas ({resultado.resumen_cambios.length})
                                </h3>
                                <div className="space-y-2">
                                    {resultado.resumen_cambios.map((cambio, i) => (
                                        <div key={i} className="bg-card border border-border rounded-lg p-3 hover:border-violet-200 transition-colors">
                                            <div className="flex items-start gap-2">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{cambio.campo.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm text-foreground mt-0.5">{cambio.razon}</p>
                                                    <p className="text-xs text-green-600 font-medium mt-1">{cambio.mejora_clave}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tendencias aplicadas */}
                        {resultado.tendencias_aplicadas.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    Tendencias 2025-2026 aplicadas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {resultado.tendencias_aplicadas.map((t, i) => (
                                        <div key={i} className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 max-w-full">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">{t.tendencia}</p>
                                            <p className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-0.5">{t.descripcion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Consejo adicional */}
                        {resultado.consejo_adicional && (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Consejo adicional</p>
                                <p className="text-sm text-amber-800 dark:text-amber-300">{resultado.consejo_adicional}</p>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="border-t pt-4 mt-2 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading || isApplying}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    {resultado && (
                        <Button
                            onClick={onAplicar}
                            disabled={isApplying || Object.keys(resultado.campos_mejorados).length === 0}
                            className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-md"
                        >
                            {isApplying
                                ? <><Loader2 className="h-4 w-4 animate-spin" />Aplicando...</>
                                : <><CheckCircle2 className="h-4 w-4" />Aplicar mejoras</>
                            }
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
