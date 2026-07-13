import axios from "axios"
import { refresh } from "../auth/services/authService"

let isRefreshing = false
let failedRequestQueue = []
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api"

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

export const authApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((queueError) => Promise.reject(queueError))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await refresh()
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

const processQueue = (error) => {
  failedRequestQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })

  failedRequestQueue = []
}

export default api
