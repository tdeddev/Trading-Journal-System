export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    token: null as string | null,
    isLoggedIn: false,
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userDisplayName: (state) => {
      if (!state.user) return ''
      return state.user.first_name 
        ? `${state.user.first_name} ${state.user.last_name || ''}`.trim()
        : state.user.username || state.user.email
    }
  },
  
  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post('/auth/login', credentials)
        
        if (response.success) {
          const { user, token } = response.data
          
          // Store in state
          this.user = user
          this.token = token
          this.isLoggedIn = true
          
          // Store in cookie
          const tokenCookie = useCookie('auth-token', {
            default: () => null,
            httpOnly: false,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
          tokenCookie.value = token
          
          // Store user in cookie
          const userCookie = useCookie('auth-user', {
            default: () => null,
            httpOnly: false,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
          userCookie.value = JSON.stringify(user)
          
          return { success: true }
        } else {
          throw new Error(response.message || 'Login failed')
        }
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async register(userData: {
      username: string
      email: string
      password: string
      first_name?: string
      last_name?: string
      timezone?: string
    }) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post('/auth/register', userData)
        
        if (response.success) {
          const { user, token } = response.data
          
          // Auto-login after registration
          this.user = user
          this.token = token
          this.isLoggedIn = true
          
          // Store in cookies
          const tokenCookie = useCookie('auth-token')
          tokenCookie.value = token
          
          const userCookie = useCookie('auth-user')
          userCookie.value = JSON.stringify(user)
          
          return { success: true }
        } else {
          throw new Error(response.message || 'Registration failed')
        }
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      // Clear state
      this.user = null
      this.token = null
      this.isLoggedIn = false
      this.error = null
      
      // Clear cookies
      const tokenCookie = useCookie('auth-token')
      const userCookie = useCookie('auth-user')
      tokenCookie.value = null
      userCookie.value = null
      
      // Redirect to login
      await navigateTo('/auth/login')
    },
    
    async verifyToken() {
      const tokenCookie = useCookie('auth-token')
      const userCookie = useCookie('auth-user')
      
      if (!tokenCookie.value || !userCookie.value) {
        return false
      }
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get('/auth/verify')
        
        if (response.success) {
          this.user = response.data.user
          this.token = tokenCookie.value
          this.isLoggedIn = true
          return true
        } else {
          // Token invalid, clear everything
          await this.logout()
          return false
        }
      } catch (error) {
        // Token verification failed, clear everything
        await this.logout()
        return false
      }
    },
    
    async refreshToken() {
      const tokenCookie = useCookie('auth-token')
      
      if (!tokenCookie.value) {
        return false
      }
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post('/auth/refresh')
        
        if (response.success) {
          this.token = response.data.token
          tokenCookie.value = response.data.token
          return true
        } else {
          await this.logout()
          return false
        }
      } catch (error) {
        await this.logout()
        return false
      }
    },
    
    async updateProfile(profileData: {
      first_name?: string
      last_name?: string
      timezone?: string
    }) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.put('/users/profile', profileData)
        
        if (response.success) {
          // Update user in state
          this.user = { ...this.user, ...profileData }
          
          // Update user cookie
          const userCookie = useCookie('auth-user')
          userCookie.value = JSON.stringify(this.user)
          
          return { success: true }
        } else {
          throw new Error(response.message || 'Profile update failed')
        }
      } catch (error: any) {
        this.error = error.message || 'Profile update failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    // Initialize auth state from cookies
    initializeAuth() {
      const tokenCookie = useCookie('auth-token')
      const userCookie = useCookie('auth-user')
      
      if (tokenCookie.value && userCookie.value) {
        try {
          this.token = tokenCookie.value
          this.user = JSON.parse(userCookie.value)
          this.isLoggedIn = true
        } catch (error) {
          // Invalid user data, clear everything
          this.logout()
        }
      }
    }
  }
})