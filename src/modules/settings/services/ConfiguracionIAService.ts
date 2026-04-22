import api from '@/core/api/bolsaEmpleoIA';
import type { ConfiguracionIA, ProveedorIA } from '../types/ConfiguracionIATypes';

export const ConfiguracionIAService = {
    async obtener(personaId: number): Promise<ConfiguracionIA> {
        const response = await api.get(`/configuracion-ia/${personaId}`);
        return response.data.data;
    },

    async obtenerModelos(proveedor: ProveedorIA) {
        const response = await api.get(`/configuracion-ia/proveedores?proveedor=${proveedor}`);
        return response.data.data;
    },

    async guardar(personaId: number, proveedor: ProveedorIA, modelo: string, apiKey?: string) {
        const response = await api.post(`/configuracion-ia/${personaId}`, {
            proveedor,
            modelo,
            api_key: apiKey || undefined
        });
        return response.data;
    }
};
