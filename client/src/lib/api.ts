import axios from 'axios'
import toast from 'react-hot-toast'

// Get API URL from environment or use fallbacks
const getApiUrl = () => {
  // Check for Vercel environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 Using VITE_API_URL:', import.meta.env.VITE_API_URL)
    return import.meta.env.VITE_API_URL
  }
  
  // Check if we're in production (Vercel)
  if (window.location.hostname !== 'localhost') {
    // You can set a default production API URL here
    // For now, we'll use a placeholder that will show an error
    console.log('🌐 Using production fallback URL')
    return 'https://your-backend-api.com/api'
  }
  
  // Local development fallback
  console.log('🌐 Using local development URL: http://localhost:3001/api')
  return 'http://localhost:3001/api'
}

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle API connection errors gracefully
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('API Connection Error:', error)
      toast.error('Unable to connect to server. Please check your internet connection.')
      return Promise.reject(error)
    }
    
    const message = error.response?.data?.error || error.message || 'Something went wrong'
    
    // Don't show toast for auth errors (handled by components)
    if (error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export { api } 