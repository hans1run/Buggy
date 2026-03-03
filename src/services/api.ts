import axios, { type AxiosInstance } from 'axios'
import router from '../router'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000
})

apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push({ name: 'login' })
    }
    return Promise.reject(error)
  }
)

export default apiClient
