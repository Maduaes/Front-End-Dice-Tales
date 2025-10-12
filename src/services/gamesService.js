import api from "./api"

export const getGamesView = async () => {
  try{
    const response = await api.get('/games')
    return response.data
  }catch(error) {
    console.error(error || 'Erro ao carregar os jogos!')
    throw error
  }
}