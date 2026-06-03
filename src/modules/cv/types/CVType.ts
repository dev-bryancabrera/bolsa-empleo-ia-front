export interface CVData {
    id?: number;
    persona_id: number;
    titulo_profesional: string;
    resumen_profesional: string;
    nivel_educacion: string;
    anios_experiencia: number;
    sector_profesional: string;
    email?: string;
    telefono?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    ciudad?: string;
    pais?: string;
    disponibilidad?: string;
    modalidad_trabajo?: string;
    estado?: boolean;
    created_at?: string;
}

export interface ExperienciaLaboral {
    id?: number;
    id_cv: number;
    empresa: string;
    cargo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin?: string;
    es_trabajo_actual: boolean;
}

export interface Educacion {
    id?: number;
    id_cv: number;
    institucion: string;
    titulo: string;
    nivel: string;
    fecha_inicio: string;
    fecha_fin?: string;
    en_curso: boolean;
    descripcion?: string;
}

export interface Idioma {
    id?: number;
    id_cv: number;
    nombre: string;
    nivel: string;
}

export interface Certificacion {
    id?: number;
    id_cv: number;
    nombre: string;
    emisor?: string;
    fecha?: string;
    url_credencial?: string;
}
