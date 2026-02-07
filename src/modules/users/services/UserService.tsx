import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA';
import type { UsuarioData } from '../types/UserTypes';

export const UserService = {
    /* Apis Usuarios */
    crearUsuario: async (usuarioData: UsuarioData & { id_persona: number }) => {
        const { data } = await bolsaEmpleoIA.post('/admin', usuarioData);
        return data;
    },

    listarUsuarios: async () => {
        const { data } = await bolsaEmpleoIA.get('/admin');
        return data;
    },

    obtenerUsuario: async (id: number) => {
        const { data } = await bolsaEmpleoIA.get(`/admin/${id}`);
        return data;
    },

    obtenerUsuarioPorPersona: async (personaId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/admin/persona/${personaId}`);
        return data;
    },

    obtenerPersonaPorUsuario: async (usuarioId: number) => {
        const { data } = await bolsaEmpleoIA.get(`/admin/user/${usuarioId}`);
        return data;
    },

    actualizarUsuario: async (id: number, usuarioData: Partial<UsuarioData>) => {
        const { data } = await bolsaEmpleoIA.put(`/admin/${id}`, usuarioData);
        return data;
    },

    eliminarUsuario: async (id: number) => {
        const { data } = await bolsaEmpleoIA.delete(`/admin/${id}`);
        return data;
    },

    /* Perfil Usuario */
    obtenerPerfil: async (idUser: number) => {
        const { data } = await bolsaEmpleoIA.get(`/auth/perfil/${idUser}`);
        return data.usuario;
    },

    actualizarPerfil: async (idUser: number, perfilData: Partial<UsuarioData>) => {
        const { data } = await bolsaEmpleoIA.put(`/auth/perfil/${idUser}`, perfilData);
        return data;
    },
}