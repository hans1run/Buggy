import axios, { type AxiosInstance } from 'axios'
import router from '../router'
import { getTokenSilently } from './auth0-service'

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
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const token = await getTokenSilently()
        if (token) {
          localStorage.setItem('auth_token', token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }
      } catch {
        // Token refresh failed
      }
      localStorage.removeItem('auth_token')
      router.push({ name: 'login' })
    }
    return Promise.reject(error)
  }
)

export default apiClient
