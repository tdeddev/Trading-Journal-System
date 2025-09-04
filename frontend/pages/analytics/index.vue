<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Comprehensive performance analysis and trading insights
        </p>
      </div>

      <!-- Period Selector -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="period in periods" 
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="selectedPeriod === period.value ? 'btn-primary' : 'btn-secondary'"
            class="text-sm"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Performance Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ analyticsStore.performanceData.total_trades }}</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:trophy" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ analyticsStore.performanceData.win_rate }}%</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
              <p 
                class="text-2xl font-bold"
                :class="analyticsStore.performanceData.total_pnl >= 0 ? 'profit-positive' : 'profit-negative'"
              >
                ${{ formatNumber(analyticsStore.performanceData.total_pnl) }}
              </p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:calculator" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Factor</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ analyticsStore.performanceData.profit_factor }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Equity Curve -->
        <div class="trading-card">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Equity Curve
            </h3>
          </div>
          <div class="p-6">
            <EquityCurve 
              :data="analyticsStore.equityData"
              :period="selectedPeriod"
              :loading="analyticsStore.loadingEquity"
              :error="analyticsStore.errorEquity"
            />
          </div>
        </div>

        <!-- Win/Loss Ratio -->
        <div class="trading-card">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Win/Loss Distribution
            </h3>
          </div>
          <div class="p-6">
            <WinLossRatio 
              :winning-trades="analyticsStore.performanceData.winning_trades"
              :losing-trades="analyticsStore.performanceData.losing_trades"
              :loading="analyticsStore.loading"
              :error="analyticsStore.error"
            />
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Symbol Performance -->
        <div class="trading-card">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Symbol Performance
            </h3>
          </div>
          <div class="p-6">
            <SymbolPerformance 
              :data="analyticsStore.symbolData"
              :loading="analyticsStore.loadingSymbols"
              :error="analyticsStore.errorSymbols"
            />
          </div>
        </div>

        <!-- Session Performance -->
        <div class="trading-card">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Session Performance
            </h3>
          </div>
          <div class="p-6">
            <div v-if="analyticsStore.loadingSessions" class="flex items-center justify-center py-16">
              <Icon name="heroicons:arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
              <span class="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
            
            <div v-else-if="analyticsStore.errorSessions" class="text-center py-16">
              <Icon name="heroicons:x-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p class="text-sm text-red-800 dark:text-red-400">{{ analyticsStore.errorSessions }}</p>
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="session in analyticsStore.sessionData" 
                :key="session.session_name"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex items-center">
                  <div 
                    class="w-3 h-3 rounded-full mr-3"
                    :class="getSessionColor(session.session_name)"
                  ></div>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ session.session_name }}
                  </span>
                </div>
                <div class="text-right">
                  <p 
                    class="font-medium text-sm"
                    :class="session.total_pnl >= 0 ? 'profit-positive' : 'profit-negative'"
                  >
                    ${{ formatNumber(session.total_pnl) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ session.win_rate }}% win rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats Table -->
      <div class="trading-card">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Detailed Performance Metrics
          </h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Metric
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="metric in detailedMetrics" :key="metric.name">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ metric.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    :class="metric.colorClass || 'text-gray-900 dark:text-white'"
                    class="font-medium"
                  >
                    {{ metric.value }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ metric.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Analytics - Trading Journal System'
})

// Import chart components
const EquityCurve = defineAsyncComponent(() => import('~/components/charts/EquityCurve.vue'))
const WinLossRatio = defineAsyncComponent(() => import('~/components/charts/WinLossRatio.vue'))
const SymbolPerformance = defineAsyncComponent(() => import('~/components/charts/SymbolPerformance.vue'))

// Analytics store
const analyticsStore = useAnalyticsStore()

// Period selector
const periods = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '12M', value: '12m' },
  { label: 'All', value: 'all' }
]

const selectedPeriod = ref('12m')

// Computed detailed metrics
const detailedMetrics = computed(() => [
  {
    name: 'Total Trades',
    value: analyticsStore.performanceData.total_trades.toString(),
    description: 'Total number of closed trades'
  },
  {
    name: 'Win Rate',
    value: `${analyticsStore.performanceData.win_rate}%`,
    description: 'Percentage of profitable trades',
    colorClass: parseFloat(analyticsStore.performanceData.win_rate) >= 50 ? 'profit-positive' : 'profit-negative'
  },
  {
    name: 'Profit Factor',
    value: analyticsStore.performanceData.profit_factor.toString(),
    description: 'Gross profit divided by gross loss',
    colorClass: parseFloat(analyticsStore.performanceData.profit_factor) >= 1 ? 'profit-positive' : 'profit-negative'
  },
  {
    name: 'Best Trade',
    value: `$${formatNumber(analyticsStore.performanceData.best_trade)}`,
    description: 'Largest winning trade',
    colorClass: 'profit-positive'
  },
  {
    name: 'Worst Trade',
    value: `$${formatNumber(analyticsStore.performanceData.worst_trade)}`,
    description: 'Largest losing trade',
    colorClass: 'profit-negative'
  },
  {
    name: 'Average P&L',
    value: `$${formatNumber(analyticsStore.performanceData.avg_pnl)}`,
    description: 'Average profit/loss per trade',
    colorClass: analyticsStore.performanceData.avg_pnl >= 0 ? 'profit-positive' : 'profit-negative'
  }
])

// Load analytics data
const loadAnalyticsData = async () => {
  await analyticsStore.fetchAllData(selectedPeriod.value)
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadAnalyticsData()
})

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const getSessionColor = (sessionName: string) => {
  const colors = {
    'London': 'bg-blue-500',
    'New York': 'bg-green-500',
    'Tokyo': 'bg-red-500',
    'Sydney': 'bg-yellow-500'
  }
  return colors[sessionName] || 'bg-gray-500'
}

// Load data on mount
onMounted(() => {
  loadAnalyticsData()
})
</script>