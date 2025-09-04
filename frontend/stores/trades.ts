export const useTradesStore = defineStore('trades', {
  state: () => ({
    trades: [] as any[],
    currentTrade: null as any,
    loading: false,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      total: 0,
      totalPages: 0
    },
    filters: {
      symbol: '',
      strategy_id: '',
      session_id: '',
      trade_status: 'all',
      date_from: '',
      date_to: ''
    }
  }),
  
  getters: {
    openTrades: (state) => state.trades.filter(trade => trade.trade_status === 'Open'),
    closedTrades: (state) => state.trades.filter(trade => trade.trade_status === 'Closed'),
    
    totalPnL: (state) => {
      return state.trades
        .filter(trade => trade.trade_status === 'Closed')
        .reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    },
    
    winRate: (state) => {
      const closedTrades = state.trades.filter(trade => trade.trade_status === 'Closed')
      if (closedTrades.length === 0) return 0
      
      const winningTrades = closedTrades.filter(trade => trade.pnl > 0)
      return (winningTrades.length / closedTrades.length * 100)
    },
    
    profitFactor: (state) => {
      const closedTrades = state.trades.filter(trade => trade.trade_status === 'Closed')
      const winningTrades = closedTrades.filter(trade => trade.pnl > 0)
      const losingTrades = closedTrades.filter(trade => trade.pnl < 0)
      
      if (losingTrades.length === 0) return 0
      
      const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0)
      const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0))
      
      return grossLoss === 0 ? 0 : (grossProfit / grossLoss)
    }
  },
  
  actions: {
    async fetchTrades(options = {}) {
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
          if (params[key] === '' || params[key] === 'all') {
            delete params[key]
          }
        })
        
        const response = await $api.get('/trades', { params })
        
        if (response.success) {
          this.trades = response.data.trades
          this.pagination = {
            currentPage: response.data.pagination.current_page,
            perPage: response.data.pagination.per_page,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.total_pages
          }
        }
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch trades'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async fetchTradeById(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.get(`/trades/${id}`)
        
        if (response.success) {
          this.currentTrade = response.data.trade
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Trade not found')
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch trade'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async createTrade(tradeData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.post('/trades', tradeData)
        
        if (response.success) {
          // Add to trades list if we're on first page
          if (this.pagination.currentPage === 1) {
            this.trades.unshift(response.data)
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to create trade')
      } catch (error: any) {
        this.error = error.message || 'Failed to create trade'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async updateTrade(id: string | number, tradeData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.put(`/trades/${id}`, tradeData)
        
        if (response.success) {
          // Update in trades list
          const index = this.trades.findIndex(trade => trade.id === id)
          if (index !== -1) {
            this.trades[index] = { ...this.trades[index], ...response.data }
          }
          
          // Update current trade if it's the same
          if (this.currentTrade?.id === id) {
            this.currentTrade = { ...this.currentTrade, ...response.data }
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to update trade')
      } catch (error: any) {
        this.error = error.message || 'Failed to update trade'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async closeTrade(id: string | number, closeData: any) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.put(`/trades/${id}/close`, closeData)
        
        if (response.success) {
          // Update in trades list
          const index = this.trades.findIndex(trade => trade.id === id)
          if (index !== -1) {
            this.trades[index] = response.data
          }
          
          // Update current trade if it's the same
          if (this.currentTrade?.id === id) {
            this.currentTrade = response.data
          }
          
          return { success: true, data: response.data }
        }
        
        throw new Error(response.message || 'Failed to close trade')
      } catch (error: any) {
        this.error = error.message || 'Failed to close trade'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async deleteTrade(id: string | number) {
      this.loading = true
      this.error = null
      
      try {
        const { $api } = useNuxtApp()
        const response = await $api.delete(`/trades/${id}`)
        
        if (response.success) {
          // Remove from trades list
          this.trades = this.trades.filter(trade => trade.id !== id)
          
          // Clear current trade if it's the same
          if (this.currentTrade?.id === id) {
            this.currentTrade = null
          }
          
          return { success: true }
        }
        
        throw new Error(response.message || 'Failed to delete trade')
      } catch (error: any) {
        this.error = error.message || 'Failed to delete trade'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    setFilters(newFilters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.currentPage = 1 // Reset to first page when filtering
    },
    
    setPage(page: number) {
      this.pagination.currentPage = page
    },
    
    clearFilters() {
      this.filters = {
        symbol: '',
        strategy_id: '',
        session_id: '',
        trade_status: 'all',
        date_from: '',
        date_to: ''
      }
      this.pagination.currentPage = 1
    },
    
    clearError() {
      this.error = null
    }
  }
})