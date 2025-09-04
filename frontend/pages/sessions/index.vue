<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Trading Sessions
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your London, New York, Tokyo, and Sydney trading sessions
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0">
          <NuxtLink 
            to="/sessions/new"
            class="btn-primary inline-flex items-center"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            New Session
          </NuxtLink>
        </div>
      </div>

      <!-- Active Sessions -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Session Status
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- London Session -->
          <div class="trading-card p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div 
                  class="w-3 h-3 rounded-full mr-3"
                  :class="sessionsStore.isSessionActive('London') ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
                <h3 class="font-medium text-gray-900 dark:text-white">London</h3>
              </div>
              <Icon name="heroicons:clock" class="w-5 h-5 text-gray-400" />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              08:00 - 17:00 GMT
            </p>
            <p class="text-xs">
              <span :class="sessionsStore.isSessionActive('London') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                {{ sessionsStore.isSessionActive('London') ? '🟢 Active' : '🔴 Closed' }}
              </span>
            </p>
          </div>

          <!-- New York Session -->
          <div class="trading-card p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div 
                  class="w-3 h-3 rounded-full mr-3"
                  :class="sessionsStore.isSessionActive('New York') ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
                <h3 class="font-medium text-gray-900 dark:text-white">New York</h3>
              </div>
              <Icon name="heroicons:clock" class="w-5 h-5 text-gray-400" />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              13:00 - 22:00 GMT
            </p>
            <p class="text-xs">
              <span :class="sessionsStore.isSessionActive('New York') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                {{ sessionsStore.isSessionActive('New York') ? '🟢 Active' : '🔴 Closed' }}
              </span>
            </p>
          </div>

          <!-- Tokyo Session -->
          <div class="trading-card p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div 
                  class="w-3 h-3 rounded-full mr-3"
                  :class="sessionsStore.isSessionActive('Tokyo') ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
                <h3 class="font-medium text-gray-900 dark:text-white">Tokyo</h3>
              </div>
              <Icon name="heroicons:clock" class="w-5 h-5 text-gray-400" />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              00:00 - 09:00 GMT
            </p>
            <p class="text-xs">
              <span :class="sessionsStore.isSessionActive('Tokyo') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                {{ sessionsStore.isSessionActive('Tokyo') ? '🟢 Active' : '🔴 Closed' }}
              </span>
            </p>
          </div>

          <!-- Sydney Session -->
          <div class="trading-card p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div 
                  class="w-3 h-3 rounded-full mr-3"
                  :class="sessionsStore.isSessionActive('Sydney') ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
                <h3 class="font-medium text-gray-900 dark:text-white">Sydney</h3>
              </div>
              <Icon name="heroicons:clock" class="w-5 h-5 text-gray-400" />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              22:00 - 07:00 GMT
            </p>
            <p class="text-xs">
              <span :class="sessionsStore.isSessionActive('Sydney') ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                {{ sessionsStore.isSessionActive('Sydney') ? '🟢 Active' : '🔴 Closed' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Session Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:calendar-days" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ sessionsStore.sessions.length }}</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
              <p 
                class="text-2xl font-bold"
                :class="sessionsStore.totalSessionPnL >= 0 ? 'profit-positive' : 'profit-negative'"
              >
                ${{ formatNumber(sessionsStore.totalSessionPnL) }}
              </p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:trophy" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Best Session</p>
              <p class="text-lg font-bold text-gray-900 dark:text-white">
                {{ sessionsStore.bestSession?.session_name || 'N/A' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="trading-card p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Session Filter -->
          <div>
            <label class="form-label">Session</label>
            <select 
              v-model="filters.session_name"
              @change="applyFilters"
              class="form-input"
            >
              <option value="">All Sessions</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Sydney">Sydney</option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="form-label">From Date</label>
            <input 
              v-model="filters.date_from"
              @change="applyFilters"
              type="date"
              class="form-input"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="form-label">To Date</label>
            <input 
              v-model="filters.date_to"
              @change="applyFilters"
              type="date"
              class="form-input"
            />
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button 
              @click="clearFilters"
              class="btn-secondary w-full"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>

          <!-- Refresh -->
          <div class="flex items-end">
            <button 
              @click="refreshSessions"
              :disabled="sessionsStore.loading"
              class="btn-primary w-full"
            >
              <Icon 
                name="heroicons:arrow-path" 
                class="w-4 h-4 mr-2"
                :class="{ 'animate-spin': sessionsStore.loading }"
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Sessions List -->
      <div class="trading-card">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Your Sessions
          </h3>
        </div>

        <!-- Loading State -->
        <div v-if="sessionsStore.loading" class="p-6">
          <div class="flex items-center justify-center py-8">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
            <span class="ml-2 text-gray-600 dark:text-gray-400">Loading sessions...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="sessionsStore.error" class="p-6">
          <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-400">
                  {{ sessionsStore.error }}
                </p>
                <button 
                  @click="refreshSessions"
                  class="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="sessionsStore.sessions.length === 0" class="p-6">
          <div class="text-center py-8">
            <Icon name="heroicons:clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 mb-4">No sessions found</p>
            <NuxtLink 
              to="/sessions/new"
              class="btn-primary inline-flex items-center"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Create Your First Session
            </NuxtLink>
          </div>
        </div>

        <!-- Sessions Grid -->
        <div v-else class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="session in sessionsStore.sessions" 
              :key="session.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <!-- Session Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div 
                    class="w-3 h-3 rounded-full mr-3"
                    :class="getSessionStatusColor(session.session_name)"
                  ></div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    {{ session.session_name }}
                  </h3>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(session.session_date) }}
                </span>
              </div>

              <!-- Session Stats -->
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Trades:</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ session.trade_count || 0 }}</span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">P&L:</span>
                  <span 
                    class="font-medium"
                    :class="(session.calculated_pnl || 0) >= 0 ? 'profit-positive' : 'profit-negative'"
                  >
                    ${{ formatNumber(session.calculated_pnl || 0) }}
                  </span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Win Rate:</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ session.trade_count > 0 ? ((session.winning_trades / session.trade_count) * 100).toFixed(1) : 0 }}%
                  </span>
                </div>
              </div>

              <!-- Market Bias -->
              <div v-if="session.market_bias" class="mb-4">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getBiasColor(session.market_bias)"
                >
                  {{ session.market_bias }} Bias
                </span>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <NuxtLink 
                  :to="`/sessions/${session.id}`"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm font-medium"
                >
                  View Details
                </NuxtLink>
                
                <div class="flex space-x-2">
                  <NuxtLink 
                    :to="`/sessions/${session.id}/edit`"
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </NuxtLink>
                  
                  <button 
                    @click="deleteSession(session.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="sessionsStore.pagination.totalPages > 1" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700 dark:text-gray-300">
                Showing {{ (sessionsStore.pagination.currentPage - 1) * sessionsStore.pagination.perPage + 1 }}
                to {{ Math.min(sessionsStore.pagination.currentPage * sessionsStore.pagination.perPage, sessionsStore.pagination.total) }}
                of {{ sessionsStore.pagination.total }} results
              </div>
              
              <div class="flex items-center space-x-2">
                <button 
                  @click="previousPage"
                  :disabled="sessionsStore.pagination.currentPage === 1"
                  class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  Page {{ sessionsStore.pagination.currentPage }} of {{ sessionsStore.pagination.totalPages }}
                </span>
                
                <button 
                  @click="nextPage"
                  :disabled="sessionsStore.pagination.currentPage === sessionsStore.pagination.totalPages"
                  class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
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
  title: 'Sessions - Trading Journal System'
})

const sessionsStore = useSessionsStore()

// Filters
const filters = reactive({
  session_name: '',
  date_from: '',
  date_to: ''
})

// Load sessions on mount
onMounted(() => {
  sessionsStore.fetchSessions()
})

// Filter methods
const applyFilters = () => {
  sessionsStore.setFilters(filters)
  sessionsStore.fetchSessions()
}

const clearFilters = () => {
  Object.assign(filters, {
    session_name: '',
    date_from: '',
    date_to: ''
  })
  sessionsStore.clearFilters()
  sessionsStore.fetchSessions()
}

const refreshSessions = () => {
  sessionsStore.fetchSessions()
}

// Pagination
const previousPage = () => {
  if (sessionsStore.pagination.currentPage > 1) {
    sessionsStore.setPage(sessionsStore.pagination.currentPage - 1)
    sessionsStore.fetchSessions()
  }
}

const nextPage = () => {
  if (sessionsStore.pagination.currentPage < sessionsStore.pagination.totalPages) {
    sessionsStore.setPage(sessionsStore.pagination.currentPage + 1)
    sessionsStore.fetchSessions()
  }
}

// Delete session
const deleteSession = async (id) => {
  if (confirm('Are you sure you want to delete this session?')) {
    const result = await sessionsStore.deleteSession(id)
    if (result.success) {
      // Refresh list if needed
      if (sessionsStore.sessions.length === 0 && sessionsStore.pagination.currentPage > 1) {
        sessionsStore.setPage(sessionsStore.pagination.currentPage - 1)
        sessionsStore.fetchSessions()
      }
    }
  }
}

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getSessionStatusColor = (sessionName: string) => {
  return sessionsStore.isSessionActive(sessionName) ? 'bg-green-500' : 'bg-gray-400'
}

const getBiasColor = (bias: string) => {
  switch (bias) {
    case 'Bullish': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Bearish': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'Neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}
</script>