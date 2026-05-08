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
    // TEMPORARY MOCK FALLBACK for Auth Routes
    // This allows the UI to proceed to the dashboard even if the backend is down
    const isAuthRoute = error.config?.url?.includes('/auth/')
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response
    const isServerError = error.response?.status >= 500

    if (isAuthRoute && (isNetworkError || isServerError)) {
      console.warn('Backend connection failed, activating Temporary Mock Auth Mode')
      
      let mockEmail = 'demo@intellmeet.ai'
      let mockName = 'Premium User'
      
      try {
        const requestData = JSON.parse(error.config.data)
        mockEmail = requestData.email || mockEmail
        mockName = requestData.name || 'Premium User'
      } catch (e) {}

      return Promise.resolve({
        data: {
          user: {
            id: 'mock-user-uuid',
            name: mockName,
            email: mockEmail,
            role: 'user',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            bio: 'This is a mock account for testing the premium UI dashboard.'
          },
          token: 'mock-jwt-token-for-development-purposes'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      })
    }

    if (error.response?.status === 401) {
      console.warn('Unauthorized request - session may have expired')
    }
    return Promise.reject(error)
  }
)

export default api
