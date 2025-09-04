<template>
  <div class="risk-analytics-container">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Advanced Risk Analytics
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Comprehensive risk metrics and trading psychology analysis
      </p>
    </div>

    <!-- Period Selector -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="period in periods" 
          :key="period.value"
          @click="selectedPeriod = period.value; loadRiskMetrics()"
          :class="selectedPeriod === period.value ? 'btn-primary' : 'btn-secondary'"
          class="text-sm"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Advanced Risk Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Risk Metrics Card -->
      <div class="trading-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Risk Metrics
          </h3>
          <Icon name="heroicons:shield-check" class="w-6 h-6 text-blue-600" />
        </div>

        <div v-if="loadingMetrics" class="flex items-center justify-center py-8">
          <Icon name="heroicons:arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
          <span class="ml-2 text-gray-600 dark:text-gray-400">Calculating metrics...</span>
        </div>

        <div v-else-if="riskMetrics" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="metric-item">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Sharpe Ratio</dt>
              <dd class="text-xl font-bold text-gray-900 dark:text-white">{{ riskMetrics.sharpe_ratio }}</dd>
            </div>
            <div class="metric-item">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Sortino Ratio</dt>
              <dd class="text-xl font-bold text-gray-900 dark:text-white">{{ riskMetrics.sortino_ratio }}</dd>
            </div>
            <div class="metric-item">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Max Drawdown</dt>
              <dd class="text-xl font-bold text-red-600">${{ riskMetrics.max_drawdown }}</dd>
            </div>
            <div class="metric-item">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Calmar Ratio</dt>
              <dd class="text-xl font-bold text-gray-900 dark:text-white">{{ riskMetrics.calmar_ratio }}</dd>
            </div>
            <div class="metric-item">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">VaR (95%)</dt>
              <dd class="text-xl font-bold text-red-600">${{ riskMetrics.var_95 }}</dd>
            </div>
            <div class="metric-item">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">CVaR (95%)</dt>
              <dd class="text-xl font-bold text-red-700">${{ riskMetrics.cvar_95 }}</dd>
            </div>
          </div>

          <!-- Additional Metrics -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">Expectancy:</span>
                <span class="font-medium ml-2">${{ riskMetrics.expectancy }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Kelly %:</span>
                <span class="font-medium ml-2">{{ riskMetrics.kelly_criterion }}%</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Win Streak:</span>
                <span class="font-medium ml-2">{{ riskMetrics.largest_win_streak }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">Loss Streak:</span>
                <span class="font-medium ml-2">{{ riskMetrics.largest_loss_streak }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Psychology Analysis -->
      <div class="trading-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Trading Psychology
          </h3>
          <Icon name="heroicons:face-smile" class="w-6 h-6 text-green-600" />
        </div>

        <div v-if="loadingPsychology" class="flex items-center justify-center py-8">
          <Icon name="heroicons:arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
          <span class="ml-2 text-gray-600 dark:text-gray-400">Analyzing psychology...</span>
        </div>

        <div v-else-if="psychologyData" class="space-y-4">
          <!-- Emotion Analysis -->
          <div v-if="psychologyData.emotion_analysis.length > 0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Emotional Impact</h4>
            <div class="space-y-2">
              <div 
                v-for="emotion in psychologyData.emotion_analysis.slice(0, 5)" 
                :key="emotion.emotion"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div class="flex items-center">
                  <span class="font-medium">{{ emotion.emotion }}</span>
                  <span class="text-xs text-gray-500 ml-2">({{ emotion.trade_count }} trades)</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium" :class="emotion.avg_pnl >= 0 ? 'text-green-600' : 'text-red-600'">
                    ${{ emotion.avg_pnl }}
                  </div>
                  <div class="text-xs text-gray-500">{{ emotion.win_rate }}% win rate</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div v-if="psychologyData.recommendations.length > 0" class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
            <div class="space-y-2">
              <div 
                v-for="(rec, index) in psychologyData.recommendations" 
                :key="index"
                class="flex items-start p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
              >
                <Icon name="heroicons:light-bulb" class="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <span class="text-sm text-blue-800 dark:text-blue-300">{{ rec }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monte Carlo Simulation -->
    <div class="trading-card p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Monte Carlo Risk Simulation
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Future portfolio value predictions based on historical performance
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="runMonteCarloSimulation"
            :disabled="loadingMonteCarlo"
            class="btn-primary flex items-center text-sm"
          >
            <Icon name="heroicons:calculator" class="w-4 h-4 mr-2" />
            {{ loadingMonteCarlo ? 'Simulating...' : 'Run Simulation' }}
          </button>
        </div>
      </div>

      <div v-if="loadingMonteCarlo" class="flex items-center justify-center py-12">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
        <span class="ml-2 text-gray-600 dark:text-gray-400">Running 1000 simulations...</span>
      </div>

      <div v-else-if="monteCarloData" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Simulation Results -->
        <div>
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Simulation Results (1 Year)</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <span class="text-sm text-gray-700 dark:text-gray-300">Best Case (95th percentile)</span>
              <span class="font-bold text-green-700 dark:text-green-400">${{ monteCarloData.statistics.percentile_75 }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span class="text-sm text-gray-700 dark:text-gray-300">Expected Outcome (Median)</span>
              <span class="font-bold text-blue-700 dark:text-blue-400">${{ monteCarloData.statistics.median }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <span class="text-sm text-gray-700 dark:text-gray-300">Worst Case (5th percentile)</span>
              <span class="font-bold text-red-700 dark:text-red-400">${{ monteCarloData.statistics.var_95 }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-sm text-gray-700 dark:text-gray-300">Probability of Loss</span>
              <span class="font-bold text-gray-700 dark:text-gray-300">{{ monteCarloData.probability_of_loss }}%</span>
            </div>
          </div>
        </div>

        <!-- Risk Assessment -->
        <div>
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Risk Assessment</h4>
          <div class="space-y-4">
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-500 mr-2" />
                <span class="font-medium text-gray-900 dark:text-white">Value at Risk (95%)</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                There's a 5% chance your portfolio could be worth less than 
                <span class="font-bold">${{ monteCarloData.statistics.var_95 }}</span> 
                in one year.
              </p>
            </div>
            
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex items-center mb-2">
                <Icon name="heroicons:chart-bar-square" class="w-5 h-5 text-blue-500 mr-2" />
                <span class="font-medium text-gray-900 dark:text-white">Expected Return</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Based on historical performance, your portfolio is expected to be worth 
                <span class="font-bold">${{ monteCarloData.statistics.avg_final_value }}</span> 
                on average.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Matrix -->
    <div class="trading-card p-6">
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Risk Assessment Matrix
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Overall risk evaluation based on your trading metrics
        </p>
      </div>

      <div v-if="riskMetrics" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Risk Level -->
        <div class="text-center">
          <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3" :class="getRiskLevelColor().bg">
            <Icon :name="getRiskLevelColor().icon" class="w-10 h-10" :class="getRiskLevelColor().text" />
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white">Risk Level</h4>
          <p class="text-sm" :class="getRiskLevelColor().text">{{ getRiskLevel() }}</p>
        </div>

        <!-- Trading Style -->
        <div class="text-center">
          <div class="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
            <Icon name="heroicons:chart-bar" class="w-10 h-10 text-blue-600" />
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white">Trading Style</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ getTradingStyle() }}</p>
        </div>

        <!-- Recommendation -->
        <div class="text-center">
          <div class="w-20 h-20 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
            <Icon name="heroicons:academic-cap" class="w-10 h-10 text-purple-600" />
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white">Recommendation</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ getRecommendation() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

// State
const selectedPeriod = ref('12m')
const loadingMetrics = ref(false)
const loadingPsychology = ref(false)
const loadingMonteCarlo = ref(false)
const riskMetrics = ref(null)
const psychologyData = ref(null)
const monteCarloData = ref(null)

// Periods
const periods = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '12M', value: '12m' },
  { label: 'All', value: 'all' }
]

// Methods
const loadRiskMetrics = async () => {
  loadingMetrics.value = true
  try {
    const response = await $api.get('/risk-analytics/advanced-metrics', {
      params: { period: selectedPeriod.value }
    })
    
    if (response.success) {
      riskMetrics.value = response.data
    }
  } catch (error) {
    console.error('Failed to load risk metrics:', error)
  } finally {
    loadingMetrics.value = false
  }
}

const loadPsychologyAnalysis = async () => {
  loadingPsychology.value = true
  try {
    const response = await $api.get('/risk-analytics/psychology-analysis')
    
    if (response.success) {
      psychologyData.value = response.data
    }
  } catch (error) {
    console.error('Failed to load psychology analysis:', error)
  } finally {
    loadingPsychology.value = false
  }
}

const runMonteCarloSimulation = async () => {
  loadingMonteCarlo.value = true
  try {
    const response = await $api.get('/risk-analytics/monte-carlo', {
      params: { simulations: 1000, periods: 252 }
    })
    
    if (response.success) {
      monteCarloData.value = response.data
    } else {
      // Handle insufficient data case
      console.warn('Monte Carlo simulation failed:', response.message)
    }
  } catch (error) {
    console.error('Failed to run Monte Carlo simulation:', error)
  } finally {
    loadingMonteCarlo.value = false
  }
}

// Risk assessment helpers
const getRiskLevel = () => {
  if (!riskMetrics.value) return 'Unknown'
  
  const { max_drawdown, sharpe_ratio, var_95 } = riskMetrics.value
  
  if (max_drawdown > 500 || sharpe_ratio < 0 || var_95 < -200) return 'High Risk'
  if (max_drawdown > 200 || sharpe_ratio < 1 || var_95 < -100) return 'Medium Risk'
  return 'Low Risk'
}

const getRiskLevelColor = () => {
  const level = getRiskLevel()
  switch (level) {
    case 'High Risk':
      return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600', icon: 'heroicons:exclamation-triangle' }
    case 'Medium Risk':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600', icon: 'heroicons:exclamation-circle' }
    default:
      return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600', icon: 'heroicons:check-circle' }
  }
}

const getTradingStyle = () => {
  if (!riskMetrics.value) return 'Unknown'
  
  const { avg_trade_duration, profit_factor } = riskMetrics.value
  
  if (avg_trade_duration < 60) return 'Scalper'
  if (avg_trade_duration < 240) return 'Day Trader'
  if (avg_trade_duration < 1440) return 'Swing Trader'
  return 'Position Trader'
}

const getRecommendation = () => {
  if (!riskMetrics.value) return 'Load data first'
  
  const riskLevel = getRiskLevel()
  const { profit_factor, sharpe_ratio } = riskMetrics.value
  
  if (riskLevel === 'High Risk') return 'Reduce position sizes'
  if (profit_factor < 1.2) return 'Improve strategy selection'
  if (sharpe_ratio > 1.5) return 'Consider scaling up'
  return 'Continue current approach'
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    loadRiskMetrics(),
    loadPsychologyAnalysis()
  ])
})
</script>

<style scoped>
.metric-item {
  @apply p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}
</style>