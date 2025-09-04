export const useAnalyticsStore = defineStore('analytics', () => {
  const { $api } = useNuxtApp()

  // State
  const loading = ref(false)
  const error = ref('')

  // Performance data
  const performanceData = reactive({
    total_trades: 0,
    winning_trades: 0,
    losing_trades: 0,
    total_pnl: 0,
    win_rate: 0,
    profit_factor: 0,
    best_trade: 0,
    worst_trade: 0,
    avg_pnl: 0,
    avg_win: 0,
    avg_loss: 0,
    avg_duration: 0,
    symbols_traded: 0,
    active_days: 0
  })

  // Chart data
  const equityData = ref([])
  const symbolData = ref([])
  const sessionData = ref([])
  const monthlyData = ref([])
  const emotionData = ref([])

  // Loading states for individual sections
  const loadingEquity = ref(false)
  const loadingSymbols = ref(false)
  const loadingSessions = ref(false)
  const loadingMonthly = ref(false)
  const loadingEmotions = ref(false)

  // Error states for individual sections
  const errorEquity = ref('')
  const errorSymbols = ref('')
  const errorSessions = ref('')
  const errorMonthly = ref('')
  const errorEmotions = ref('')

  // Actions
  const fetchPerformanceData = async (period = '12m') => {
    loading.value = true
    error.value = ''

    try {
      const response = await $api.get('/analytics/performance', {
        params: { period }
      })

      if (response.success) {
        Object.assign(performanceData, response.data)
      } else {
        error.value = response.message || 'Failed to fetch performance data'
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch performance data'
      console.error('Fetch performance error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchEquityCurve = async (period = '12m') => {
    loadingEquity.value = true
    errorEquity.value = ''

    try {
      const response = await $api.get('/analytics/equity-curve', {
        params: { period }
      })

      if (response.success) {
        equityData.value = response.data
      } else {
        errorEquity.value = response.message || 'Failed to fetch equity data'
      }
    } catch (err) {
      errorEquity.value = err.message || 'Failed to fetch equity data'
      console.error('Fetch equity curve error:', err)
    } finally {
      loadingEquity.value = false
    }
  }

  const fetchSymbolData = async () => {
    loadingSymbols.value = true
    errorSymbols.value = ''

    try {
      const response = await $api.get('/analytics/symbols')

      if (response.success) {
        symbolData.value = response.data
      } else {
        errorSymbols.value = response.message || 'Failed to fetch symbol data'
      }
    } catch (err) {
      errorSymbols.value = err.message || 'Failed to fetch symbol data'
      console.error('Fetch symbols error:', err)
    } finally {
      loadingSymbols.value = false
    }
  }

  const fetchSessionData = async () => {
    loadingSessions.value = true
    errorSessions.value = ''

    try {
      const response = await $api.get('/analytics/sessions')

      if (response.success) {
        sessionData.value = response.data
      } else {
        errorSessions.value = response.message || 'Failed to fetch session data'
      }
    } catch (err) {
      errorSessions.value = err.message || 'Failed to fetch session data'
      console.error('Fetch sessions error:', err)
    } finally {
      loadingSessions.value = false
    }
  }

  const fetchMonthlyData = async (year) => {
    loadingMonthly.value = true
    errorMonthly.value = ''

    try {
      const response = await $api.get('/analytics/monthly', {
        params: { year }
      })

      if (response.success) {
        monthlyData.value = response.data
      } else {
        errorMonthly.value = response.message || 'Failed to fetch monthly data'
      }
    } catch (err) {
      errorMonthly.value = err.message || 'Failed to fetch monthly data'
      console.error('Fetch monthly data error:', err)
    } finally {
      loadingMonthly.value = false
    }
  }

  const fetchEmotionData = async () => {
    loadingEmotions.value = true
    errorEmotions.value = ''

    try {
      const response = await $api.get('/analytics/emotions')

      if (response.success) {
        emotionData.value = response.data
      } else {
        errorEmotions.value = response.message || 'Failed to fetch emotion data'
      }
    } catch (err) {
      errorEmotions.value = err.message || 'Failed to fetch emotion data'
      console.error('Fetch emotion data error:', err)
    } finally {
      loadingEmotions.value = false
    }
  }

  // Fetch all analytics data for a period
  const fetchAllData = async (period = '12m') => {
    await Promise.all([
      fetchPerformanceData(period),
      fetchEquityCurve(period),
      fetchSymbolData(),
      fetchSessionData(),
      fetchMonthlyData(new Date().getFullYear()),
      fetchEmotionData()
    ])
  }

  // Risk metrics
  const fetchRiskMetrics = async () => {
    try {
      const response = await $api.get('/analytics/risk')
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch risk metrics')
      }
    } catch (err) {
      console.error('Fetch risk metrics error:', err)
      throw err
    }
  }

  // Drawdown analysis
  const fetchDrawdownData = async () => {
    try {
      const response = await $api.get('/analytics/drawdown')
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch drawdown data')
      }
    } catch (err) {
      console.error('Fetch drawdown error:', err)
      throw err
    }
  }

  return {
    // State
    loading,
    error,
    performanceData,
    equityData,
    symbolData,
    sessionData,
    monthlyData,
    emotionData,
    
    // Loading states
    loadingEquity,
    loadingSymbols,
    loadingSessions,
    loadingMonthly,
    loadingEmotions,
    
    // Error states
    errorEquity,
    errorSymbols,
    errorSessions,
    errorMonthly,
    errorEmotions,
    
    // Actions
    fetchPerformanceData,
    fetchEquityCurve,
    fetchSymbolData,
    fetchSessionData,
    fetchMonthlyData,
    fetchEmotionData,
    fetchAllData,
    fetchRiskMetrics,
    fetchDrawdownData
  }
})