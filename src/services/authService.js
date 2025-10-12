import { authApi,  setAccessToken } from './api'

export const login = async (email, password) => {
  const response = await authApi.post('/auth/login', { email, password })
  const { accessToken: token } = response.data
  setAccessToken(token)
  return token
}

export const refresh = async () => {
  try {
    const { data } = await authApi.patch('/auth/refresh')
    setAccessToken(data.accessToken)
  } catch (error) {
    console.warn('Usuário não logado ou refresh falhou: ', error)
    throw error
  }
}