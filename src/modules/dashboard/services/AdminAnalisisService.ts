import bolsaEmpleoIA from '@/core/api/bolsaEmpleoIA'

export const AdminAnalisisService = {
    analizarCVs: async (consulta?: string) => {
        const { data } = await bolsaEmpleoIA.post('/admin/analizar-cvs', { consulta })
        return data.data
    },
}
