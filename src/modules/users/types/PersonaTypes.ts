export interface PersonaData {
    nombre: string;
    apellido: string;
    identificacion: string;
    telefono?: string | null;
    fecha_nacimiento?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    pais?: string | null;
}