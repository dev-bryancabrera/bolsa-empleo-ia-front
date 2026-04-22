export type ProveedorIA = 'groq' | 'openai' | 'anthropic';

export interface ModeloIA {
    id: string;
    nombre: string;
    gratuito: boolean;
}

export interface ProveedorInfo {
    id: ProveedorIA;
    nombre: string;
    gratuito: boolean;
    descripcion: string;
}

export interface ConfiguracionIA {
    proveedor: ProveedorIA;
    modelo: string;
    tiene_api_key: boolean;
    proveedores: ProveedorInfo[];
    modelos: ModeloIA[];
}
