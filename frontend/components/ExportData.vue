<template>
  <div class="export-data-container">
    <!-- Export Header -->
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Export Data
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Download your trading data in CSV or Excel format
      </p>
    </div>

    <!-- Export Options -->
    <div class="space-y-6">
      <!-- Trades Export -->
      <div class="trading-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">Trades Data</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Export all your trade records with detailed information
            </p>
          </div>
          <Icon name="heroicons:chart-bar" class="w-8 h-8 text-blue-600" />
        </div>

        <!-- Filters for Trades -->
        <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date From
            </label>
            <input
              v-model="tradesFilters.date_from"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date To
            </label>
            <input
              v-model="tradesFilters.date_to"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              v-model="tradesFilters.trade_status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Trades</option>
              <option value="Open">Open Only</option>
              <option value="Closed">Closed Only</option>
            </select>
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            @click="exportTrades('csv')"
            :disabled="exporting"
            class="btn-secondary flex items-center"
          >
            <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
            {{ exporting === 'trades-csv' ? 'Exporting...' : 'Export CSV' }}
          </button>
          <button
            @click="exportTrades('excel')"
            :disabled="exporting"
            class="btn-primary flex items-center"
          >
            <Icon name="heroicons:table-cells" class="w-4 h-4 mr-2" />
            {{ exporting === 'trades-excel' ? 'Exporting...' : 'Export Excel' }}
          </button>
        </div>
      </div>

      <!-- Sessions Export -->
      <div class="trading-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">Sessions Data</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Export your trading session records and performance
            </p>
          </div>
          <Icon name="heroicons:clock" class="w-8 h-8 text-green-600" />
        </div>

        <div class="flex space-x-3">
          <button
            @click="exportSessions('csv')"
            :disabled="exporting"
            class="btn-secondary flex items-center"
          >
            <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
            {{ exporting === 'sessions-csv' ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>

      <!-- Strategies Export -->
      <div class="trading-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">Strategies Data</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Export your trading strategies and their performance metrics
            </p>
          </div>
          <Icon name="heroicons:lightbulb" class="w-8 h-8 text-purple-600" />
        </div>

        <div class="flex space-x-3">
          <button
            @click="exportStrategies('csv')"
            :disabled="exporting"
            class="btn-secondary flex items-center"
          >
            <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
            {{ exporting === 'strategies-csv' ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>

      <!-- Complete Export -->
      <div class="trading-card p-6 border-2 border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Icon name="heroicons:star" class="w-5 h-5 text-yellow-500 mr-2" />
              Complete Export
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Export all your data (trades, sessions, strategies) in a single Excel file with multiple sheets
            </p>
          </div>
          <Icon name="heroicons:archive-box" class="w-8 h-8 text-blue-600" />
        </div>

        <button
          @click="exportComplete()"
          :disabled="exporting"
          class="btn-primary flex items-center text-lg px-6 py-3"
        >
          <Icon name="heroicons:cloud-arrow-down" class="w-5 h-5 mr-2" />
          {{ exporting === 'complete' ? 'Exporting Complete Data...' : 'Export All Data (Excel)' }}
        </button>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message.text" class="mt-6">
      <div 
        :class="message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'"
        class="p-4 rounded-lg"
      >
        <div class="flex">
          <Icon 
            :name="message.type === 'success' ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
            :class="message.type === 'success' ? 'text-green-400' : 'text-red-400'"
            class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" 
          />
          <p 
            :class="message.type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'"
            class="text-sm"
          >
            {{ message.text }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

// State
const exporting = ref<string>('')
const message = reactive({
  text: '',
  type: 'success' as 'success' | 'error'
})

// Filters for trades export
const tradesFilters = reactive({
  date_from: '',
  date_to: '',
  trade_status: 'all'
})

// Methods
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.text = text
  message.type = type
  setTimeout(() => {
    message.text = ''
  }, 5000)
}

const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportTrades = async (format: 'csv' | 'excel') => {
  const exportKey = `trades-${format}`
  exporting.value = exportKey
  
  try {
    const config = useRuntimeConfig()
    const authToken = useCookie('auth-token')
    
    // Build query parameters
    const params = new URLSearchParams()
    if (tradesFilters.date_from) params.append('date_from', tradesFilters.date_from)
    if (tradesFilters.date_to) params.append('date_to', tradesFilters.date_to)
    if (tradesFilters.trade_status !== 'all') params.append('trade_status', tradesFilters.trade_status)
    
    const queryString = params.toString()
    const url = `${config.public.apiBase}/exports/trades/${format}${queryString ? '?' + queryString : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const filename = `trades_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
    
    downloadFile(downloadUrl, filename)
    showMessage(`Trades data exported successfully as ${format.toUpperCase()}!`)
    
    window.URL.revokeObjectURL(downloadUrl)
    
  } catch (error) {
    console.error('Export error:', error)
    showMessage(`Failed to export trades data. Please try again.`, 'error')
  } finally {
    exporting.value = ''
  }
}

const exportSessions = async (format: 'csv') => {
  const exportKey = `sessions-${format}`
  exporting.value = exportKey
  
  try {
    const config = useRuntimeConfig()
    const authToken = useCookie('auth-token')
    
    const url = `${config.public.apiBase}/exports/sessions/${format}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const filename = `sessions_export_${new Date().toISOString().split('T')[0]}.csv`
    
    downloadFile(downloadUrl, filename)
    showMessage('Sessions data exported successfully as CSV!')
    
    window.URL.revokeObjectURL(downloadUrl)
    
  } catch (error) {
    console.error('Export error:', error)
    showMessage('Failed to export sessions data. Please try again.', 'error')
  } finally {
    exporting.value = ''
  }
}

const exportStrategies = async (format: 'csv') => {
  const exportKey = `strategies-${format}`
  exporting.value = exportKey
  
  try {
    const config = useRuntimeConfig()
    const authToken = useCookie('auth-token')
    
    const url = `${config.public.apiBase}/exports/strategies/${format}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const filename = `strategies_export_${new Date().toISOString().split('T')[0]}.csv`
    
    downloadFile(downloadUrl, filename)
    showMessage('Strategies data exported successfully as CSV!')
    
    window.URL.revokeObjectURL(downloadUrl)
    
  } catch (error) {
    console.error('Export error:', error)
    showMessage('Failed to export strategies data. Please try again.', 'error')
  } finally {
    exporting.value = ''
  }
}

const exportComplete = async () => {
  exporting.value = 'complete'
  
  try {
    const config = useRuntimeConfig()
    const authToken = useCookie('auth-token')
    
    const url = `${config.public.apiBase}/exports/complete/excel`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const filename = `trading_journal_complete_${new Date().toISOString().split('T')[0]}.xlsx`
    
    downloadFile(downloadUrl, filename)
    showMessage('Complete trading journal exported successfully! 🎉', 'success')
    
    window.URL.revokeObjectURL(downloadUrl)
    
  } catch (error) {
    console.error('Export error:', error)
    showMessage('Failed to export complete data. Please try again.', 'error')
  } finally {
    exporting.value = ''
  }
}
</script>