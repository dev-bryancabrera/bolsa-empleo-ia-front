import bolsaEmpleoIA from "@/core/api/bolsaEmpleoIA";
import type { HabilidadData } from "../types/HabilidadType";

export const HabilidadService = {
    // Listar todas las habilidades
    listarHabilidades: async () => {
        const { data } = await bolsaEmpleoIA.get('/habilidades');
        return data;
    },

    // Obtener habilidades por CV
    obtenerHabilidadesPorCV: async (cvId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/habilidades/cv/${cvId}`);
        return data;
    },

    // Crear habilidad
    crearHabilidad: async (habilidadData: HabilidadData) => {
        const { data } = await bolsaEmpleoIA.post('/habilidades', habilidadData);
        return data;
    },

    // Obtener habilidad por ID
    obtenerHabilidadPorId: async (id: number) => {
        const { data } = await bolsaEmpleoIA.get(`/habilidades/${id}`);
        return data;
    },

    // Actualizar habilidad
    actualizarHabilidad: async (id: number, habilidadData: Partial<HabilidadData>) => {
        const { data } = await bolsaEmpleoIA.put(`/habilidades/${id}`, habilidadData);
        return data;
    },

    // Eliminar habilidad
    eliminarHabilidad: async (id: number) => {
        const { data } = await bolsaEmpleoIA.delete(`/habilidades/${id}`);
        return data;
    }
}