import bolsaEmpleoIA from "@/core/api/bolsaEmpleoIA";
import type {
    TendenciaResponse,
    Estadisticas,
    RutaAprendizaje,
    Recomendacion,
    EmpleoSugerido,
    HabilidadDemandada,
    PlataformaRecomendada,
    TendenciaSector,
    InsightsPersonalizados
} from "../types/TendenciaTypes";

export const TendenciaService = {
    /* Apis Tendencia */

    // Obtener tendencias vigentes (o generar si no existen)
    obtenerTendencias: async (id_persona: number) => {
        const { data } = await bolsaEmpleoIA.get(`/tendencias/${id_persona}`);
        return data;
    },

    // Generar nuevas tendencias (forzar generación)
    generarTendencias: async (id_persona: number): Promise<TendenciaResponse> => {
        const { data } = await bolsaEmpleoIA.post(`/tendencias/${id_persona}/generar`);
        return data;
    },

    // Regenerar tendencias (invalida anteriores y crea nuevas)
    regenerarTendencias: async (id_persona: number): Promise<TendenciaResponse> => {
        const { data } = await bolsaEmpleoIA.post(`/tendencias/${id_persona}/regenerar`);
        return data;
    },
};