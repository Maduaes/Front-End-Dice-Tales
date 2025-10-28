import api from "./api"

export const getGamesView = async () => {
  try{
    const response = await api.get('/games/all')
    return response.data
  }catch(error) {
    console.error(error || 'Erro ao carregar os jogos!')
    throw error
  }
}

export const createGame = async ( name ) => {
  try{
    const response = await api.post('/games', {name: name})
    return response.data
  }catch {
    console.log('deu erro')
  }
}