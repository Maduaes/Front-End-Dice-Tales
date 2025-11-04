import { authApi,  setAccessToken } from '../../services/api'

export const login = async (email, password) => {
  const response = await authApi.post('/auth/login', { email, password })
  const { accessToken: token } = response.data
  setAccessToken(token)
  return token
}

export const refresh = async () => {
  try {
    const { data } = await authApi.patch('/auth/refresh')
    if(data) {
      setAccessToken(data.token)
      return data.token
    }
  } catch (error) {
    console.warn('Usuário não logado ou refresh falhou: ', error)
    throw error
  }
}