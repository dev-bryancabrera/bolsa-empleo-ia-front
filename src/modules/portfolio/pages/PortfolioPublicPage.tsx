import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { PortfolioService } from '../services/PortfolioService';
import { MinimalistaTemplate } from '../templates/MinimalistaTemplate';
import { ProfesionalTemplate } from '../templates/ProfesionalTemplate';
import { CreativoTemplate } from '../templates/CreativoTemplate';
import type { PortfolioPublicoData } from '../types/PortfolioTypes';

export const PortfolioPublicPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<PortfolioPublicoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        PortfolioService.obtenerPublico(slug)
            .then(setData)
            .catch(err => {
                const msg = err?.response?.status === 404 ? 'Portafolio no encontrado'
                    : err?.response?.status === 403 ? 'Este portafolio no está publicado todavía'
                    : 'Error al cargar el portafolio';
                setError(msg);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
    );

    if (error || !data) return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{error || 'Portafolio no disponible'}</h1>
            <p className="text-sm text-muted-foreground max-w-sm">Verifica que la URL sea correcta o que el portafolio esté publicado.</p>
        </div>
    );

    const { portfolio, persona, cv, experiencias, educaciones, habilidades, idiomas, certificaciones } = data;

    if (!cv) return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Portafolio sin CV</h1>
            <p className="text-sm text-muted-foreground">El propietario aún no ha completado su perfil profesional.</p>
        </div>
    );

    const props = { persona, cv, config: portfolio.configuracion, contenido: portfolio.contenido_extra, experiencias, educaciones, habilidades, idiomas, certificaciones };

    return (
        <div className="min-h-screen">
            {portfolio.plantilla === 'profesional' && <ProfesionalTemplate {...props} />}
            {portfolio.plantilla === 'creativo' && <CreativoTemplate {...props} />}
            {(!portfolio.plantilla || portfolio.plantilla === 'minimalista') && <MinimalistaTemplate {...props} />}
        </div>
    );
};
