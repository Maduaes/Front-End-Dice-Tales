import api from './api'

export const createSheet = async ({
  game_system,
  sheet_type,
  name
}) => {
  try {
    const response = await api.post('/sheets/', {
      game_system,
      sheet_type,
      name,
    })

    return response.data
  } catch (error) {
    console.error(error)

    if (error.response) {
      throw error.response.data
    }

    throw error
  }
}

export const getRecentSheets = async () => {
  try{
    const response = await api.get('/sheets/recent')
    return response.data
  }catch(error){
    if (error.response?.status === 404) {
      return []
    }
    console.error(error || 'Erro ao encontrar fichas recentes!')
    throw error
  }
}

export const getAllSheets = async () => {
  try{
    const response = await api.get('/sheets/all/')
    return Array.isArray(response.data) ? response.data : []
  }catch(error){
    if (error.response?.status === 404) {
      return []
    }
    console.error(error || 'Erro ao encontrar fichas!')
    throw error
  }
}
