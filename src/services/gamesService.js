import api from "./api"

const normalizeRoom = (room) => {
  if (!room) {
    return null
  }

  return {
    ...room,
    name: room.room_name ?? room.name ?? "",
    room_name: room.room_name ?? room.name ?? "",
    thumb_image_url: room.thumb_image_url ?? room.thumbImageUrl ?? null,
    imagePath: room.thumb_image_url ?? room.thumbImageUrl ?? room.imagePath ?? null,
  }
}

export const getGameByPublicId = async (publicId) => {
  try{
    const response = await api.get(`/rooms/public/${publicId}`)
    return normalizeRoom(response.data)
  }catch(error) {
    console.error(error || 'Erro ao carregar a sala!')
    throw error
  }
}

export const getGameById = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}`)
    return normalizeRoom(response.data)
  } catch (error) {
    console.error(error || 'Erro ao carregar a sala!')
    throw error
  }
}

export const getRecentGames = async () => {
  try{
    const response = await api.get('/rooms/recent/')
    return Array.isArray(response.data)
      ? response.data.map(normalizeRoom)
      : []
  }catch(error) {
    console.warn(error || 'Erro ao carregar as salas!')
    throw error
  }
}

export const getAllGames = async () => {
  const response = await api.get('/rooms/all/')
  return Array.isArray(response.data) ? response.data.map(normalizeRoom) : []
}

export const createGame = async (name, gameSystem = 'D&D5e') => {
  try{
    const response = await api.post('/rooms/', { room_name: name, game_system: gameSystem })
    return normalizeRoom(response.data)
  }catch (error) {
    console.error(error || 'Erro ao criar a sala!')
    throw error
  }
}

export const editGame = async (id, name) => {
  try{
    const response = await api.patch(`/rooms/${id}`, { room_name: name })
    return normalizeRoom(response.data)
  }catch (error) {
    console.error(error || 'Erro ao editar a sala!')
    throw error
  }
}

export const uploadGameCover = async (id, file) => {
  try{
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.patch(`/rooms/upload/thumb/${id}`, formData)
    return normalizeRoom(response.data)
  }catch (error) {
    console.error(error || 'Erro ao atualizar a capa da sala!')
    throw error
  }
}

export const joinGame = async (code) => {
  try{
    const response = await api.post(`/rooms/join/${code.trim().toUpperCase()}`)
    return normalizeRoom(response.data)
  }catch (error) {
    console.error(error || 'Erro ao entrar na sala!')
    throw error
  }
}

export const deleteGame = async (id) => {
  try{
    await api.delete(`/rooms/${id}`)
  }catch (error) {
    console.error(error || 'Erro ao remover a sala!')
    throw error
  }
}
