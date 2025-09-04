export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessions: [] as any[],
    currentSession: null as any,
    loading: false,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      perPage: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      session_name: '',
      date_from: '',
      date_to: ''
    }
  }),
  
  getters: {
    activeSessions: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.sessions.filter(session => session.session_date === today)
    },
    
    sessionPerformance: (state) => {
      return state.sessions.map(session => ({
        ...session,
        win_rate: session.trade_count > 0 
          ? ((session.winning_trades / session.trade_count) * 100).toFixed(1)
          : 0,
        avg_pnl: session.trade_count > 0 
          ? (session.calculated_pnl / session.trade_count).toFixed(2)
          : 0
      }))
    },
    
    totalSessionPnL: (state) => {
      return state.sessions.reduce((total, session) => total + (session.calculated_pnl || 0), 0)
    },
    
    bestSession: (state) => {
      return state.sessions.reduce((best, session) => {
        return (session.calculated_pnl || 0) > (best?.calculated_pnl || 0) ? session : best
      }, null)
    },
    
    sessionsByType: (state) => {
      const grouped = {
        London: [],
        'New York': [],
        Tokyo: [],
        Sydney: []
      }
      
      state.sessions.forEach(session => {
        if (grouped[session.session_name]) {
          grouped[session.session_name].push(session)
        }
      })
      
      return grouped
    }
  },
  
  actions: {
    async fetchSessions(options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.perPage,
          ...this.filters,
          ...options
        }
        
        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key]
          }
        })
        
        const response = await $api.get('/sessions', { params })
        
        if (response.success) {
          this.sessions = response.data.sessions
          this.pagination = {
            currentPage: response.data.pagination.current_page,
            perPage: response.data.pagination.per_page,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.total_pages
          }
        }
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch sessions'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async fetchSessionById(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get(`/sessions/${id}`)
        
        if (response.success) {
          this.currentSession = response.data.session
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Session not found')
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch session'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async createSession(sessionData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post('/sessions', sessionData)
        
        if (response.success) {
          // Add to sessions list if we're on first page
          if (this.pagination.currentPage === 1) {
            this.sessions.unshift(response.data)
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to create session')
      } catch (error: any) {
        this.error = error.message || 'Failed to create session'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async updateSession(id: string | number, sessionData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.put(`/sessions/${id}`, sessionData)
        
        if (response.success) {
          // Update in sessions list
          const index = this.sessions.findIndex(session => session.id === id)
          if (index !== -1) {
            this.sessions[index] = { ...this.sessions[index], ...response.data }
          }
          
          // Update current session if it's the same
          if (this.currentSession?.id === id) {
            this.currentSession = { ...this.currentSession, ...response.data }
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to update session')
      } catch (error: any) {
        this.error = error.message || 'Failed to update session'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async deleteSession(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.delete(`/sessions/${id}`)
        
        if (response.success) {
          // Remove from sessions list
          this.sessions = this.sessions.filter(session => session.id !== id)
          
          // Clear current session if it's the same
          if (this.currentSession?.id === id) {
            this.currentSession = null
          }
          
          return { success: true }
        }
        
        throw new Error(response.message || 'Failed to delete session')
      } catch (error: any) {
        this.error = error.message || 'Failed to delete session'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async getSessionStats(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get(`/sessions/${id}/stats`)
        
        if (response.success) {
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to fetch session stats')
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch session stats'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    setFilters(newFilters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.currentPage = 1
    },
    
    setPage(page: number) {
      this.pagination.currentPage = page
    },
    
    clearFilters() {
      this.filters = {
        session_name: '',
        date_from: '',
        date_to: ''
      }
      this.pagination.currentPage = 1
    },
    
    clearError() {
      this.error = null
    },
    
    // Utility functions for session times
    getSessionTime(sessionName: string) {
      const sessionTimes = {
        'London': '08:00 - 17:00 GMT',
        'New York': '13:00 - 22:00 GMT',
        'Tokyo': '00:00 - 09:00 GMT',
        'Sydney': '22:00 - 07:00 GMT'
      }
      return sessionTimes[sessionName] || ''
    },
    
    isSessionActive(sessionName: string) {
      const now = new Date()
      const currentHour = now.getUTCHours()
      
      const sessionHours = {
        'London': [8, 17],
        'New York': [13, 22],
        'Tokyo': [0, 9],
        'Sydney': [22, 7] // This spans midnight
      }
      
      const [start, end] = sessionHours[sessionName] || [0, 0]
      
      if (sessionName === 'Sydney') {
        // Sydney session spans midnight
        return currentHour >= start || currentHour < end
      }
      
      return currentHour >= start && currentHour < end
    }
  }
})