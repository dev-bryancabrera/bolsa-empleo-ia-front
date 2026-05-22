export interface BrechaCritica {
    competencia: string;
    nivel_actual: 'Ninguno' | 'Básico' | 'Intermedio';
    nivel_requerido: 'Intermedio' | 'Avanzado' | 'Experto';
    impacto_empleabilidad: 'Alto' | 'Medio' | 'Bajo';
    tiempo_cierre_estimado: string;
}

export interface AnalisisBrecha {
    competencias_actuales: string[];
    competencias_demandadas: string[];
    brechas_criticas: BrechaCritica[];
    puntuacion_empleabilidad_actual: number;
    puntuacion_empleabilidad_potencial: number;
    resumen_brecha: string;
}

export interface Estadisticas {
    habilidades_registradas: number;
    habilidades_nuevas_mes?: number;
    postulaciones_activas?: number;
    postulaciones_revision?: number;
    rutas_aprendizaje?: number;
    match_promedio: number;
    match_incremento?: number;
}

export interface RutaAprendizaje {
    nombre: string;
    habilidades: string[];
    gap: string;
    tiempo: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
    color: 'blue' | 'purple' | 'orange';
    match: number;
    descripcion: string;
}

export interface Recomendacion {
    tipo: 'Curso' | 'Vacante' | 'Certificación' | 'Acción' | 'Proyecto' | 'Red_profesional';
    titulo: string;
    razon: string;
    brecha_que_cierra?: string;
    icon: string;
    accion: string;
    plataforma?: 'Udemy' | 'Coursera' | 'Platzi' | 'YouTube' | 'LinkedIn_Learning';
    url?: string;
}

export interface EmpleoSugerido {
    titulo: string;
    empresa?: string;
    ubicacion: string;
    match: number;
    match_actual?: number;
    match_potencial?: number;
    salario_estimado: string;
    modalidad: 'Remoto' | 'Híbrido' | 'Presencial';
    nivel: 'Junior' | 'Semi-Senior' | 'Senior';
    brechas_para_aplicar?: string[];
    razon_match: string;
    url?: string;
}

export interface HabilidadDemandada {
    nombre: string;
    demanda: 'Alta' | 'Media' | 'Emergente';
    porcentaje_ofertas: number;
    tiempo_aprendizaje: string;
    prioridad: number;
    el_usuario_la_tiene?: boolean;
}

export interface PlataformaRecomendada {
    nombre: string;
    url: string;
    tipo: 'Empleo' | 'Networking' | 'Aprendizaje' | 'Freelance';
    razon: string;
    relevancia: number;
}

export interface TendenciaSector {
    tendencia: string;
    impacto: 'Alto' | 'Medio' | 'Bajo';
    descripcion: string;
    oportunidades?: string;
    oportunidad_para_el_perfil?: string;
}

export interface InsightsPersonalizados {
    fortalezas?: string[];
    areas_mejora?: string[];
    ventaja_competitiva: string;
    siguiente_paso?: string;
    riesgo_principal?: string;
    siguiente_paso_urgente?: string;
    plazo_para_ser_competitivo?: string;
}

export interface TendenciaData {
    id?: number;
    persona_id?: number;
    analisis_brecha?: AnalisisBrecha;
    estadisticas?: Estadisticas;
    rutas_aprendizaje?: RutaAprendizaje[];
    recomendaciones: Recomendacion[];
    empleos_sugeridos: EmpleoSugerido[];
    habilidades_demandadas: HabilidadDemandada[];
    plataformas_recomendadas: PlataformaRecomendada[];
    tendencias_sector: TendenciaSector[];
    datos_interesantes?: Array<{ titulo: string; valor: string; relevancia: string; fuente: string }>;
    insights_personalizados: InsightsPersonalizados;
    fecha_generacion?: string;
    vigente_hasta?: string;
}

export interface TendenciaResponse {
    success: boolean;
    data: TendenciaData;
    mensaje: string;
}
