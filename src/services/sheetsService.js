import api from './api'

export const getRecentSheets = async () => {
  try{
    const response = await api.get('/sheets/recent')
    return response.data
  }catch(error){
    console.error(error || 'Erro ao encontrar Fichas Recentes!')
    throw error
  }
}