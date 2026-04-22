export interface RutaGuardada {
    id: number;
    persona_id: number;
    chat_id: number | null;
    titulo: string;
    objetivo: string | null;
    duracion_meses: number | null;
    json_ruta: string;
    progreso_fases: string;
    estado: 'activa' | 'completada' | 'archivada';
    created_at: string;
    updated_at: string | null;
}

export interface RutaAprendizajeData {
    tipo: 'ruta_aprendizaje';
    titulo: string;
    nivel_inicio?: string;
    salario_esperado?: string;
    perfil_actual: {
        nivel_general: string;
        fortalezas_clave: string[];
        brechas_identificadas: string[];
        puntuacion_empleabilidad?: number;
    };
    objetivo_profesional: string;
    duracion_estimada_meses: number;
    fases: FaseAprendizaje[];
    prioridades: string[];
    indicadores_de_progreso: string[];
    proximos_pasos_inmediatos?: string[];
}

export interface FaseAprendizaje {
    fase: number;
    nombre: string;
    duracion_meses: number;
    nivel_dificultad?: string;
    objetivo: string;
    competencias_a_desarrollar: string[];
    acciones_recomendadas: string[];
    recursos_clave?: string[];
    checklist_dominio?: string[];
    resultado_esperado: string;
}
