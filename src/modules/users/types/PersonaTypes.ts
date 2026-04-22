export interface PersonaData {
    nombre: string;
    apellido: string;
    identificacion: string;
    telefono?: string | null;
    fecha_nacimiento?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    pais?: string | null;
    // Información profesional
    titulo_profesional?: string | null;
    descripcion?: string | null;
    nivel_educativo?: string | null;
    genero?: string | null;
    // Presencia digital
    linkedin?: string | null;
    github?: string | null;
    sitio_web?: string | null;
    // Preferencias laborales
    modalidad_trabajo?: string | null;
    disponibilidad?: string | null;
    salario_esperado?: string | null;
    sector_interes?: string | null;
}
