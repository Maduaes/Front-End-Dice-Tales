import api from "./api"

export const getRecentGames = async () => {
  try{
    const response = await api.get('/games/recent')
    return response.data
  }catch(error) {
    console.warn(error || 'Erro ao carregar os jogos!')
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

export const editGame = async ( id, name ) => {
  try{
    const response = await api.patch('/games', {id: id, name: name})
    return response.data
  }catch {
    console.log('deu erro de novo')
  }
}

export const joinGame = async ( code ) => {
  try{
    const response = await api.post(`/games/join/${code}`)
    return response.data
  }catch {
    console.log('adivinha')
  }
}

export const deleteGame = async (id) => {
  try{
    await api.delete('/games', { data: { id: id } })
  }catch {
    console.log('deu erro')
  }
}