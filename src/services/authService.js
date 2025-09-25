import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/auth/login', {email, password})
  const { accessToken: token } = response.data
  localStorage.setItem('token', token)
  return token
}