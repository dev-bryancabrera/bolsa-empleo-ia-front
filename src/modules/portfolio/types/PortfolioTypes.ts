export type Plantilla = 'minimalista' | 'profesional' | 'creativo';
export type Fuente = 'inter' | 'poppins' | 'playfair' | 'roboto';
export type TipoFondoHero = 'color' | 'gradiente' | 'imagen';
export type AlturaHero = 'pantalla' | 'media' | 'compacta';

export interface ColoresPortfolio {
    primario: string;
    secundario: string;
    fondo: string;
    texto: string;
    acento: string;
}

export interface SeccionesPortfolio {
    resumen: boolean;
    experiencia: boolean;
    educacion: boolean;
    habilidades: boolean;
    idiomas: boolean;
    certificaciones: boolean;
    proyectos_custom: boolean;
    contacto: boolean;
}

export interface ConfiguracionPortfolio {
    colores: ColoresPortfolio;
    fuente: Fuente;
    secciones: SeccionesPortfolio;
    orden_secciones: string[];
    tipo_fondo_hero?: TipoFondoHero;
    gradiente_hero?: string;
    hero_overlay_opacidad?: number;
    mostrar_navegacion?: boolean;
    altura_hero?: AlturaHero;
}

export interface ProyectoCustom {
    id: string;
    nombre: string;
    descripcion: string;
    tecnologias: string[];
    url?: string;
    imagen_url?: string;
    destacado: boolean;
}

export interface LinksSociales {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
}

export interface ContenidoExtra {
    bio_extendida: string;
    titulo_hero: string;
    proyectos_custom: ProyectoCustom[];
    links_sociales: LinksSociales;
    disponible_para_trabajo: boolean;
    frase_motivacional: string;
    imagen_perfil_url?: string;
    imagen_fondo_hero_url?: string;
    nombre_nav?: string;
    email_contacto?: string;
}

export interface PortfolioData {
    id?: number;
    persona_id?: number;
    plantilla: Plantilla;
    publicado: boolean;
    url_slug: string;
    configuracion: ConfiguracionPortfolio;
    contenido_extra: ContenidoExtra;
    created_at?: string;
    updated_at?: string;
}

export interface PersonaPublica {
    id: number;
    nombre: string;
    apellido: string;
    ciudad?: string;
    pais?: string;
    linkedin?: string;
    github?: string;
    sitio_web?: string;
    titulo_profesional?: string;
    descripcion?: string;
}

export interface CVPublico {
    id: number;
    titulo_profesional: string;
    resumen_profesional?: string;
    nivel_educacion?: string;
    anios_experiencia?: number;
    sector_profesional?: string;
    telefono?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    ciudad?: string;
    pais?: string;
    disponibilidad?: string;
    modalidad_trabajo?: string;
}

export interface PortfolioPublicoData {
    portfolio: PortfolioData;
    persona: PersonaPublica;
    cv: CVPublico | null;
    experiencias: ExperienciaPublica[];
    educaciones: EducacionPublica[];
    habilidades: HabilidadPublica[];
    idiomas: IdiomaPublico[];
    certificaciones: CertificacionPublica[];
}

export interface ExperienciaPublica {
    id: number;
    empresa: string;
    cargo: string;
    descripcion?: string;
    fecha_inicio: string;
    fecha_fin?: string;
    es_trabajo_actual: boolean;
}

export interface EducacionPublica {
    id: number;
    institucion: string;
    titulo: string;
    nivel: string;
    fecha_inicio: string;
    fecha_fin?: string;
    en_curso: boolean;
    descripcion?: string;
}

export interface HabilidadPublica {
    id: number;
    nombre: string;
    categoria: string;
    nivel: string;
    anios_experiencia: number;
}

export interface IdiomaPublico {
    id: number;
    nombre: string;
    nivel: string;
}

export interface CertificacionPublica {
    id: number;
    nombre: string;
    emisor?: string;
    fecha?: string;
    url_credencial?: string;
}

export interface OptimizacionPortfolioResultado {
    titulo_hero_mejorado: string;
    bio_extendida_mejorada: string;
    frase_motivacional_mejorada: string;
    secciones_recomendadas: SeccionesPortfolio;
    orden_secciones_recomendado: string[];
    plantilla_recomendada: Plantilla;
    razon_plantilla: string;
    tips_proyectos: string[];
    keywords_para_incluir: string[];
    score_antes: number;
    score_despues: number;
    resumen_mejoras: string;
}

export interface PortfolioEditorData {
    persona: PersonaPublica;
    cv: CVPublico | null;
    experiencias: ExperienciaPublica[];
    educaciones: EducacionPublica[];
    habilidades: HabilidadPublica[];
    idiomas: IdiomaPublico[];
    certificaciones: CertificacionPublica[];
}

export interface TemplateProps {
    persona: PersonaPublica;
    cv: CVPublico;
    config: ConfiguracionPortfolio;
    contenido: ContenidoExtra;
    experiencias: ExperienciaPublica[];
    educaciones: EducacionPublica[];
    habilidades: HabilidadPublica[];
    idiomas: IdiomaPublico[];
    certificaciones: CertificacionPublica[];
}
