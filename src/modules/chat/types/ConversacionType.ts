export interface ChatIAType {
    persona_id: number;
    chat_id: number;
    mensaje: string;
    respuesta: string;
    respuesta_chat: boolean;
    json: boolean;
    tipo: string;
    metadata: string;
    created_at: string;
    update_at: string;
}

export interface MensajeUI {
    id: string;
    tipo: 'usuario' | 'ia';
    contenido: string;
    timestamp: string;
    loading?: boolean;
}