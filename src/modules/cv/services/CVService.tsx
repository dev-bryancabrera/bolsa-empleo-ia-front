import bolsaEmpleoIA from "@/core/api/bolsaEmpleoIA";
import type { CVData } from "../types/CVType";

export const CVService = {
    // Crear CV
    crearCV: async (cvData: CVData) => {
        const { data } = await bolsaEmpleoIA.post('/cv', cvData);
        return data;
    },

    // Listar todos los CV
    listarCVs: async () => {
        const { data } = await bolsaEmpleoIA.get('/cv');
        return data;
    },

    // Obtener CV por ID
    obtenerCVPorId: async (id: number) => {
        const { data } = await bolsaEmpleoIA.get(`/cv/${id}`);
        return data;
    },

    // Obtener CV por persona
    obtenerCVPorPersona: async (personaId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/cv/persona/${personaId}`);
        return data;
    },
    
    // Obtener CV por usuario
    obtenerCVPorUsuario: async (usuarioId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/cv/usuario/${usuarioId}`);
        return data;
    },

    // Actualizar CV
    actualizarCV: async (id: number, cvData: Partial<CVData>) => {
        const { data } = await bolsaEmpleoIA.put(`/cv/${id}`, cvData);
        return data;
    },

    // Eliminar CV
    eliminarCV: async (id: number) => {
        const { data } = await bolsaEmpleoIA.delete(`/cv/${id}`);
        return data;
    }
}