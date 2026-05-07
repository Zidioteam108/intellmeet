import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('intellmeet-auth')
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`
        }
      } catch (e) {
        console.error('Error parsing auth storage', e)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Could trigger logout here if token is invalid
      console.warn('Unauthorized request - session may have expired')
    }
    return Promise.reject(error)
  }
)

export default api
