export interface ChatIAType {
    id: number;
    persona_id: number;
    titulo?: string;
    estado?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface ConversacionType {
    id: number;
    chat_id: number;
    persona_id: number;
    mensaje: string;
    respuesta: string;
    respuesta_chat: number; // 0 = usuario, 1 = IA
    json: number;           // 0 = texto, 1 = JSON
    tipo?: string;
    metadata?: string;
    created_at: string;
    updated_at?: string;
}

export interface MensajeUI {
    id: string;
    tipo: 'usuario' | 'ia';
    contenido: string;
    timestamp: string;
    loading?: boolean;
    esRutaAprendizaje?: boolean;
}