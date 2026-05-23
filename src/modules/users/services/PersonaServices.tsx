import bolsaEmpleoIA from "@/core/api/bolsaEmpleoIA";
import type { PersonaData } from "../types/PersonaTypes";

export const PersonaService = {
    /* Apis Persona */
    crearPersona: async (personaData: PersonaData) => {
        const { data } = await bolsaEmpleoIA.post('/api/persona', personaData);
        return data;
    },

    listarPersonas: async () => {
        const { data } = await bolsaEmpleoIA.get('/api/persona');
        return data;
    },

    obtenerPersona: async (id: number) => {
        const { data } = await bolsaEmpleoIA.get(`/api/persona/${id}`);
        return data;
    },

    actualizarPersona: async (id: number, personaData: Partial<PersonaData>) => {
        const { data } = await bolsaEmpleoIA.put(`/api/persona/${id}`, personaData);
        return data;
    },

    eliminarPersona: async (id: number) => {
        const { data } = await bolsaEmpleoIA.delete(`/api/persona/${id}`);
        return data;
    },

}