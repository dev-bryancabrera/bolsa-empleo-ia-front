import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import type { ExperienciaLaboral, Educacion, Idioma, Certificacion } from '../types/CVType';

export const ExperienciaService = {
    listarPorCV: async (cvId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/experiencia-laboral/cv/${cvId}`);
        return data;
    },
    crear: async (exp: Omit<ExperienciaLaboral, 'id'>) => {
        const { data } = await bolsaEmpleoIA.post('/experiencia-laboral', exp);
        return data;
    },
    actualizar: async (id: number, exp: Partial<ExperienciaLaboral>) => {
        const { data } = await bolsaEmpleoIA.put(`/experiencia-laboral/${id}`, exp);
        return data;
    },
    eliminar: async (id: number) => {
        await bolsaEmpleoIA.delete(`/experiencia-laboral/${id}`);
    },
};

export const EducacionService = {
    listarPorCV: async (cvId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/educacion-cv/cv/${cvId}`);
        return data;
    },
    crear: async (edu: Omit<Educacion, 'id'>) => {
        const { data } = await bolsaEmpleoIA.post('/educacion-cv', edu);
        return data;
    },
    actualizar: async (id: number, edu: Partial<Educacion>) => {
        const { data } = await bolsaEmpleoIA.put(`/educacion-cv/${id}`, edu);
        return data;
    },
    eliminar: async (id: number) => {
        await bolsaEmpleoIA.delete(`/educacion-cv/${id}`);
    },
};

export const IdiomaService = {
    listarPorCV: async (cvId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/idiomas-cv/cv/${cvId}`);
        return data;
    },
    crear: async (idioma: Omit<Idioma, 'id'>) => {
        const { data } = await bolsaEmpleoIA.post('/idiomas-cv', idioma);
        return data;
    },
    actualizar: async (id: number, idioma: Partial<Idioma>) => {
        const { data } = await bolsaEmpleoIA.put(`/idiomas-cv/${id}`, idioma);
        return data;
    },
    eliminar: async (id: number) => {
        await bolsaEmpleoIA.delete(`/idiomas-cv/${id}`);
    },
};

export const CertificacionService = {
    listarPorCV: async (cvId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/certificaciones-cv/cv/${cvId}`);
        return data;
    },
    crear: async (cert: Omit<Certificacion, 'id'>) => {
        const { data } = await bolsaEmpleoIA.post('/certificaciones-cv', cert);
        return data;
    },
    actualizar: async (id: number, cert: Partial<Certificacion>) => {
        const { data } = await bolsaEmpleoIA.put(`/certificaciones-cv/${id}`, cert);
        return data;
    },
    eliminar: async (id: number) => {
        await bolsaEmpleoIA.delete(`/certificaciones-cv/${id}`);
    },
};
