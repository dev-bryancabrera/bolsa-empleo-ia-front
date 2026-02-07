import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';

export const ConversacionService = {
    enviarMensaje: async (chat_id: number, persona_id: number, mensaje: string) => {
        const { data } = await bolsaEmpleoIA.post('/conversacion', {
            chat_id,
            persona_id,
            mensaje
        });
        return data;
    },

    // Listar todo el historial de conversaciones
    listarConversacionesPorChat: async (chatId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/conversacion/chat/${chatId}`);
        return data;
    },

    // Listar todo el historial de conversaciones
    eliminarConversacion: async () => {
        const { data } = await bolsaEmpleoIA.delete('/conversacion');
        return data;
    },

    // Eliminar todo el historial
    limpiarHistorial: async () => {
        const { data } = await bolsaEmpleoIA.delete('/conversacion');
        return data;
    },
}