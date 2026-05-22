import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import type { PortfolioData, PortfolioPublicoData, PortfolioEditorData } from '../types/PortfolioTypes';

export const PortfolioService = {
    crear: async (): Promise<PortfolioData> => {
        const { data } = await bolsaEmpleoIA.post('/portfolio');
        return data;
    },

    obtener: async (): Promise<PortfolioData> => {
        const { data } = await bolsaEmpleoIA.get('/portfolio');
        return data;
    },

    actualizar: async (payload: Partial<PortfolioData>): Promise<PortfolioData> => {
        const { data } = await bolsaEmpleoIA.put('/portfolio', payload);
        return data;
    },

    obtenerPublico: async (slug: string): Promise<PortfolioPublicoData> => {
        const { data } = await bolsaEmpleoIA.get(`/portfolio/publico/${slug}`);
        return data;
    },

    optimizar: async (): Promise<import('../types/PortfolioTypes').OptimizacionPortfolioResultado> => {
        const { data } = await bolsaEmpleoIA.post('/portfolio/optimizar');
        return data;
    },

    obtenerDatosEditor: async (): Promise<PortfolioEditorData> => {
        const { data } = await bolsaEmpleoIA.get('/portfolio/datos-editor');
        return data;
    },
};
