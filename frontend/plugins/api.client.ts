import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Create axios instance
  const api = axios.create({
    baseURL: config.public.apiBase,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  })
  
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = useCookie('auth-token')
      if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`
      }
      
      // Add request timestamp
      config.metadata = { startTime: new Date() }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const endTime = new Date()
      const duration = endTime.getTime() - response.config.metadata.startTime.getTime()
      
      // Log successful requests in development
      if (process.dev) {
        console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`)
      }
      
      return response.data
    },
    async (error) => {
      // Handle different error types
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.message || 'Unknown error occurred'
        
        switch (status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            const token = useCookie('auth-token')
            token.value = null
            await navigateTo('/auth/login')
            break
            
          case 403:
            // Forbidden
            throw new Error('Access forbidden. You do not have permission to perform this action.')
            
          case 404:
            // Not found
            throw new Error('The requested resource was not found.')
            
          case 422:
            // Validation error
            throw new Error(message)
            
          case 429:
            // Too many requests
            throw new Error('Too many requests. Please try again later.')
            
          case 500:
            // Internal server error
            throw new Error('Internal server error. Please try again later.')
            
          default:
            throw new Error(message)
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your internet connection.')
      } else {
        // Other error
        throw new Error('An unexpected error occurred.')
      }
    }
  )
  
  return {
    provide: {
      api
    }
  }
})