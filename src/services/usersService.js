import api, { authApi } from "./api"

export const createUser = async (
  email, username, password
) => {
  try{
    const response = await authApi.post('/users', {email, username, password})
    return response.data
  }catch(error) {
    console.error(error || 'Erro ao criar o usuário!')
    throw error
  }
}