import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import type { RutaGuardada, RutaAprendizajeData } from '@/modules/chat/types/RutaType';

export const RutaService = {
    guardar: async (persona_id: number, json_ruta: RutaAprendizajeData, chat_id?: number | null): Promise<RutaGuardada> => {
        const { data } = await bolsaEmpleoIA.post('/ruta-aprendizaje', {
            persona_id,
            chat_id: chat_id ?? null,
            json_ruta,
        });
        return data;
    },

    listarPorPersona: async (personaId: number): Promise<RutaGuardada[]> => {
        const { data } = await bolsaEmpleoIA.get(`/ruta-aprendizaje/persona/${personaId}`);
        return data;
    },

    actualizarProgreso: async (rutaId: number, progreso_fases: Record<string, boolean>): Promise<RutaGuardada> => {
        const { data } = await bolsaEmpleoIA.patch(`/ruta-aprendizaje/${rutaId}/progreso`, {
            progreso_fases: JSON.stringify(progreso_fases),
        });
        return data;
    },

    actualizarEstado: async (rutaId: number, estado: 'activa' | 'completada' | 'archivada'): Promise<RutaGuardada> => {
        const { data } = await bolsaEmpleoIA.patch(`/ruta-aprendizaje/${rutaId}/estado`, { estado });
        return data;
    },

    eliminar: async (rutaId: number): Promise<void> => {
        await bolsaEmpleoIA.delete(`/ruta-aprendizaje/${rutaId}`);
    },
};
