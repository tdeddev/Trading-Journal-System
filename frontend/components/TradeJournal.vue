<template>
  <div class="trade-journal-container">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Trade Journal & Notes
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Add detailed notes, tags, and analysis to your trades
      </p>
    </div>

    <!-- Trade Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Trade
      </label>
      <select
        v-model="selectedTradeId"
        @change="loadTradeDetails"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="">Select a trade to add notes...</option>
        <option v-for="trade in trades" :key="trade.id" :value="trade.id">
          {{ trade.symbol }} {{ trade.trade_type }} - {{ formatDate(trade.entry_time) }}
          {{ trade.trade_status === 'Closed' ? `(P&L: $${trade.pnl})` : '(Open)' }}
        </option>
      </select>
    </div>

    <!-- Journal Form -->
    <div v-if="selectedTrade" class="trading-card p-6">
      <!-- Trade Summary -->
      <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">Symbol:</span>
            <span class="font-medium ml-1">{{ selectedTrade.symbol }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Type:</span>
            <span class="font-medium ml-1">{{ selectedTrade.trade_type }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Entry:</span>
            <span class="font-medium ml-1">${{ selectedTrade.entry_price }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Status:</span>
            <span class="font-medium ml-1" :class="selectedTrade.trade_status === 'Open' ? 'text-blue-600' : 'text-green-600'">
              {{ selectedTrade.trade_status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Journal Form -->
      <form @submit.prevent="saveJournalEntry" class="space-y-6">
        <!-- Notes Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trade Notes
          </label>
          <div class="mb-3">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                v-for="template in noteTemplates"
                :key="template.label"
                @click="addTemplate(template.content)"
                class="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {{ template.label }}
              </button>
            </div>
          </div>
          <textarea
            v-model="journalEntry.notes"
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Describe your trade setup, market conditions, reasoning, what went well, what could be improved..."
          ></textarea>
          <div class="text-right text-xs text-gray-500 mt-1">
            {{ journalEntry.notes.length }} / 2000 characters
          </div>
        </div>

        <!-- Tags Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          
          <!-- Popular Tags -->
          <div class="mb-3">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular tags:</div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                v-for="tag in popularTags"
                :key="tag"
                @click="toggleTag(tag)"
                :class="isTagSelected(tag) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                class="px-3 py-1 text-xs rounded-full hover:bg-blue-500 hover:text-white transition-colors"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- Custom Tags Input -->
          <div class="flex gap-2">
            <input
              v-model="newTag"
              @keyup.enter="addCustomTag"
              type="text"
              placeholder="Add custom tag..."
              class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              @click="addCustomTag"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <!-- Selected Tags -->
          <div v-if="selectedTags.length > 0" class="mt-3">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected tags:</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="inline-flex items-center px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(tag)"
                  class="ml-1 w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center"
                >
                  <Icon name="heroicons:x-mark" class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Emotion & Quality -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Emotional State
            </label>
            <select
              v-model="journalEntry.emotion"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select emotion...</option>
              <option v-for="emotion in emotions" :key="emotion" :value="emotion">
                {{ emotion }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trade Quality
            </label>
            <select
              v-model="journalEntry.trade_quality"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select quality...</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="resetForm"
            class="btn-secondary"
          >
            Reset
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary flex items-center"
          >
            <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
            {{ saving ? 'Saving...' : 'Save Journal Entry' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <div class="flex">
        <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-green-800 dark:text-green-400">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Recent Journal Entries -->
    <div v-if="recentEntries.length > 0" class="mt-8">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Recent Journal Entries
      </h4>
      
      <div class="space-y-4">
        <div
          v-for="entry in recentEntries.slice(0, 5)"
          :key="entry.id"
          class="trading-card p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          @click="loadJournalEntry(entry)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ entry.symbol }} {{ entry.trade_type }}
                </span>
                <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(entry.entry_time) }}
                </span>
                <span v-if="entry.trade_status === 'Closed'" class="ml-2 text-sm font-medium" :class="entry.pnl >= 0 ? 'text-green-600' : 'text-red-600'">
                  ${{ entry.pnl }}
                </span>
              </div>
              
              <p v-if="entry.notes" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ entry.notes }}
              </p>
              
              <div v-if="entry.tags" class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="tag in entry.tags.split(',')"
                  :key="tag.trim()"
                  class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                >
                  {{ tag.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const tradesStore = useTradesStore()

// State
const selectedTradeId = ref('')
const selectedTrade = ref(null)
const trades = ref([])
const saving = ref(false)
const successMessage = ref('')
const newTag = ref('')
const recentEntries = ref([])

const journalEntry = reactive({
  notes: '',
  emotion: '',
  trade_quality: ''
})

const selectedTags = ref<string[]>([])

// Constants
const emotions = [
  'Confident', 'Anxious', 'Greedy', 'Fearful', 'Patient', 
  'Impulsive', 'Disciplined', 'Revenge'
]

const popularTags = [
  'breakout', 'pullback', 'support', 'resistance', 'momentum',
  'reversal', 'consolidation', 'news-driven', 'technical', 'fundamental',
  'high-confidence', 'risky', 'scalp', 'swing', 'day-trade'
]

const noteTemplates = [
  {
    label: 'Setup Analysis',
    content: 'Trade Setup:\n- Market condition: \n- Entry signal: \n- Risk/Reward ratio: \n- Confluence factors: \n\n'
  },
  {
    label: 'Market Context',
    content: 'Market Context:\n- Overall trend: \n- Key levels: \n- News events: \n- Volatility: \n\n'
  },
  {
    label: 'Trade Review',
    content: 'Trade Review:\n- What went well: \n- What could be improved: \n- Lessons learned: \n- Next actions: \n\n'
  },
  {
    label: 'Psychology Note',
    content: 'Psychology:\n- Emotional state: \n- Decision making: \n- Discipline level: \n- Areas for improvement: \n\n'
  }
]

// Methods
const loadTrades = async () => {
  try {
    await tradesStore.fetchTrades()
    trades.value = tradesStore.trades
  } catch (error) {
    console.error('Failed to load trades:', error)
  }
}

const loadTradeDetails = async () => {
  if (!selectedTradeId.value) {
    selectedTrade.value = null
    return
  }
  
  try {
    const response = await $api.get(`/trades/${selectedTradeId.value}`)
    if (response.success) {
      selectedTrade.value = response.data
      
      // Populate form with existing data
      journalEntry.notes = response.data.notes || ''
      journalEntry.emotion = response.data.emotion || ''
      journalEntry.trade_quality = response.data.trade_quality || ''
      
      // Parse tags
      selectedTags.value = response.data.tags 
        ? response.data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []
    }
  } catch (error) {
    console.error('Failed to load trade details:', error)
  }
}

const addTemplate = (templateContent: string) => {
  if (journalEntry.notes) {
    journalEntry.notes += '\n\n' + templateContent
  } else {
    journalEntry.notes = templateContent
  }
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const isTagSelected = (tag: string) => {
  return selectedTags.value.includes(tag)
}

const addCustomTag = () => {
  if (newTag.value && !selectedTags.value.includes(newTag.value)) {
    selectedTags.value.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const saveJournalEntry = async () => {
  saving.value = true
  successMessage.value = ''
  
  try {
    const response = await $api.put(`/trades/${selectedTradeId.value}`, {
      notes: journalEntry.notes,
      emotion: journalEntry.emotion || null,
      trade_quality: journalEntry.trade_quality || null,
      tags: selectedTags.value.join(', ')
    })
    
    if (response.success) {
      successMessage.value = 'Journal entry saved successfully!'
      setTimeout(() => successMessage.value = '', 3000)
      
      // Reload recent entries
      await loadRecentEntries()
    }
  } catch (error) {
    console.error('Failed to save journal entry:', error)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  journalEntry.notes = selectedTrade.value?.notes || ''
  journalEntry.emotion = selectedTrade.value?.emotion || ''
  journalEntry.trade_quality = selectedTrade.value?.trade_quality || ''
  selectedTags.value = selectedTrade.value?.tags 
    ? selectedTrade.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    : []
}

const loadJournalEntry = (entry: any) => {
  selectedTradeId.value = entry.id
  loadTradeDetails()
}

const loadRecentEntries = async () => {
  try {
    const response = await $api.get('/trades', {
      params: { limit: 10 }
    })
    
    if (response.success) {
      recentEntries.value = response.data.trades.filter(trade => trade.notes || trade.tags)
    }
  } catch (error) {
    console.error('Failed to load recent entries:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    loadTrades(),
    loadRecentEntries()
  ])
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>