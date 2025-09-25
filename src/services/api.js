import axios from "axios"

let isRefreshing = false
let failedRequestQueue  = []

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
})

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

// antes da requisição
// a função recebe o objeto config das requisições, e por ele, adiciona o token à header
api.interceptors.request.use((config) => { 
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// depois da requisição
api.interceptors.response.use(
  (response) => response,
  async (erro) => {
    const originalRequest = erro.config;

    if(erro.response && erro.response.status === 401 && !originalRequest._retry) {
      if(isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.post('/auth/refresh'); // se usar cookie HttpOnly, não precisa enviar token
        const { accessToken: newToken } = response.data;

        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(erro)
  }
)

export default api