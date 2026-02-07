import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';

export const ChatService = {
    // Crear un nuevo chat
    crear: async (persona_id: number, titulo?: string) => {
        const { data } = await bolsaEmpleoIA.post('/chat', {
            persona_id,
            titulo
        });
        return data;
    },

    // Listar todos los chats
    listar: async () => {
        const { data } = await bolsaEmpleoIA.get('/chat');
        return data;
    },

    // Obtener un chat por ID
    obtener: async (id: number) => {
        const { data } = await bolsaEmpleoIA.get(`/chat/${id}`);
        return data;
    },

    // Obtener chats por persona
    obtenerPorPersona: async (personaId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/chat/persona/${personaId}`);
        return data;
    },

    // Actualizar un chat
    actualizar: async (id: number, datos: any) => {
        const { data } = await bolsaEmpleoIA.put(`/chat/${id}`, datos);
        return data;
    },

    // Eliminar un chat
    eliminar: async (id: number) => {
        const { data } = await bolsaEmpleoIA.delete(`/chat/${id}`);
        return data;
    },
}