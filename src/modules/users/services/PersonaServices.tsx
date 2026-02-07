import bolsaEmpleoIA from "@/core/api/bolsaEmpleoIA";
import type { PersonaData } from "../types/PersonaTypes";

export const PersonaService = {
    /* Apis Persona */
    crearPersona: async (personaData: PersonaData) => {
        const { data } = await bolsaEmpleoIA.post('/persona', personaData);
        return data;
    },

    listarPersonas: async () => {
        const { data } = await bolsaEmpleoIA.get('/persona');
        return data;
    },

    obtenerPersona: async (id: number) => {
        const { data } = await bolsaEmpleoIA.get(`/persona/${id}`);
        return data;
    },

    actualizarPersona: async (id: number, personaData: Partial<PersonaData>) => {
        const { data } = await bolsaEmpleoIA.put(`/persona/${id}`, personaData);
        return data;
    },

    eliminarPersona: async (id: number) => {
        const { data } = await bolsaEmpleoIA.delete(`/persona/${id}`);
        return data;
    },

}