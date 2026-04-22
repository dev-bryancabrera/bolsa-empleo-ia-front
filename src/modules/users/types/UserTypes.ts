import type { PersonaData } from './PersonaTypes';

export interface UsuarioData {
    id?: number;
    id_persona?: number;
    email: string;
    password: string;
    rol?: string;
    foto_perfil?: string;
    activo?: boolean;
    persona?: PersonaData;
}
