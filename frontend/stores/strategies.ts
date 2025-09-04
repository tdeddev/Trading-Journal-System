export const useStrategiesStore = defineStore('strategies', {
  state: () => ({
    strategies: [] as any[],
    currentStrategy: null as any,
    loading: false,
    error: null as string | null,
    activeOnly: true
  }),
  
  getters: {
    activeStrategies: (state) => state.strategies.filter(strategy => strategy.is_active),
    
    strategyTypes: (state) => {
      const types = [...new Set(state.strategies.map(s => s.strategy_type))]
      return types
    },
    
    topPerformingStrategy: (state) => {
      return state.strategies.reduce((best, strategy) => {
        const currentPnL = strategy.total_pnl || 0
        const bestPnL = best?.total_pnl || 0
        return currentPnL > bestPnL ? strategy : best
      }, null)
    },
    
    strategyStats: (state) => {
      return {
        total: state.strategies.length,
        active: state.strategies.filter(s => s.is_active).length,
        profitable: state.strategies.filter(s => (s.total_pnl || 0) > 0).length,
        totalTrades: state.strategies.reduce((sum, s) => sum + (s.total_trades_count || 0), 0)
      }
    },
    
    strategyPerformanceComparison: (state) => {
      return state.strategies.map(strategy => ({
        name: strategy.strategy_name,
        winRate: strategy.calculated_success_rate || 0,
        profitFactor: strategy.calculated_profit_factor || 0,
        totalPnL: strategy.total_pnl || 0,
        totalTrades: strategy.total_trades_count || 0
      })).sort((a, b) => b.totalPnL - a.totalPnL)
    }
  },
  
  actions: {
    async fetchStrategies(activeOnly = false) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const params = activeOnly ? { active_only: 'true' } : {}
        
        const response = await $api.get('/strategies', { params })
        
        if (response.success) {
          this.strategies = response.data
          this.activeOnly = activeOnly
        }
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch strategies'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async fetchStrategyById(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get(`/strategies/${id}`)
        
        if (response.success) {
          this.currentStrategy = response.data.strategy
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Strategy not found')
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch strategy'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async createStrategy(strategyData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post('/strategies', strategyData)
        
        if (response.success) {
          // Add to strategies list
          this.strategies.unshift(response.data)
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to create strategy')
      } catch (error: any) {
        this.error = error.message || 'Failed to create strategy'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async updateStrategy(id: string | number, strategyData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.put(`/strategies/${id}`, strategyData)
        
        if (response.success) {
          // Update in strategies list
          const index = this.strategies.findIndex(strategy => strategy.id === id)
          if (index !== -1) {
            this.strategies[index] = { ...this.strategies[index], ...response.data }
          }
          
          // Update current strategy if it's the same
          if (this.currentStrategy?.id === id) {
            this.currentStrategy = { ...this.currentStrategy, ...response.data }
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to update strategy')
      } catch (error: any) {
        this.error = error.message || 'Failed to update strategy'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async deleteStrategy(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.delete(`/strategies/${id}`)
        
        if (response.success) {
          // Remove from strategies list
          this.strategies = this.strategies.filter(strategy => strategy.id !== id)
          
          // Clear current strategy if it's the same
          if (this.currentStrategy?.id === id) {
            this.currentStrategy = null
          }
          
          return { success: true }
        }
        
        throw new Error(response.message || 'Failed to delete strategy')
      } catch (error: any) {
        this.error = error.message || 'Failed to delete strategy'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async getStrategyAnalytics(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get(`/strategies/${id}/analytics`)
        
        if (response.success) {
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to fetch strategy analytics')
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch strategy analytics'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async refreshStrategyStats(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post(`/strategies/${id}/refresh-stats`)
        
        if (response.success) {
          // Update the strategy in our list with fresh stats
          const index = this.strategies.findIndex(strategy => strategy.id === id)
          if (index !== -1) {
            this.strategies[index] = { 
              ...this.strategies[index], 
              ...response.data,
              calculated_success_rate: response.data.success_rate,
              calculated_profit_factor: response.data.profit_factor
            }
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to refresh strategy stats')
      } catch (error: any) {
        this.error = error.message || 'Failed to refresh strategy stats'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    toggleStrategyStatus(id: string | number, isActive: boolean) {
      return this.updateStrategy(id, { is_active: isActive })
    },
    
    clearError() {
      this.error = null
    },
    
    // Utility methods
    getStrategyColor(type: string) {
      const colors = {
        'Pullback': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Fibonacci': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Mean Reversion': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'Custom': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      }
      return colors[type] || colors['Custom']
    },
    
    getPerformanceRating(profitFactor: number, winRate: number) {
      if (profitFactor >= 2 && winRate >= 60) return 'Excellent'
      if (profitFactor >= 1.5 && winRate >= 50) return 'Good'
      if (profitFactor >= 1 && winRate >= 40) return 'Average'
      return 'Needs Improvement'
    },
    
    getPerformanceColor(rating: string) {
      const colors = {
        'Excellent': 'text-green-600 dark:text-green-400',
        'Good': 'text-blue-600 dark:text-blue-400',
        'Average': 'text-yellow-600 dark:text-yellow-400',
        'Needs Improvement': 'text-red-600 dark:text-red-400'
      }
      return colors[rating] || colors['Average']
    }
  }
})