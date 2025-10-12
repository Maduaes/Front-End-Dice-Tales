import axios from "axios"

let accessToken = null

let isRefreshing = false
let failedRequestQueue  = []

const api = axios.create({

  baseURL: '/api',
  withCredentials: true
})

export const authApi = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// antes da requisição
api.interceptors.request.use((config) => { 
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// depois da requisição
api.interceptors.response.use(
  (response) => response,
  async (erro) => {
    const originalRequest = erro.config

    if(erro.response.status === 401 && !originalRequest._retry) {
      if(isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject })
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.patch('/auth/refresh')
        const { accessToken: newToken } = response.data

        setAccessToken(newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        processQueue(null, newToken)
        return api(originalRequest)

      } catch (err) {
        processQueue(err, null)
        return Promise.reject(err)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(erro)
  }
)

const processQueue = (erro, token = null) => {
   failedRequestQueue.forEach(promise => {
    if (erro) {
      promise.reject(erro)
    } else {
      promise.resolve(token)
    }
  })
  failedRequestQueue = []
}

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

export default api