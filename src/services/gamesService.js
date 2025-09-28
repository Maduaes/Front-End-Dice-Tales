import api from "./api"

export const getGamesView = async () => {
  try{
    const response = await api.get('/games_view')
    return response.data
  }catch(error) {
    console.error(error || 'Erro ao carregar os jogos!')
    throw error
  }
}