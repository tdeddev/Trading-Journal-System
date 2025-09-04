<template>
  <div class="relative">
    <canvas 
      ref="chartCanvas"
      class="w-full h-64"
    ></canvas>
    
    <!-- Loading Overlay -->
    <div 
      v-if="loading" 
      class="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 rounded-lg"
    >
      <Icon name="heroicons:arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading chart...</span>
    </div>

    <!-- Error State -->
    <div 
      v-if="error" 
      class="absolute inset-0 flex items-center justify-center bg-red-50/80 dark:bg-red-900/20 rounded-lg"
    >
      <div class="text-center">
        <Icon name="heroicons:x-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p class="text-sm text-red-800 dark:text-red-400">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Tooltip } from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Tooltip)

interface Props {
  data?: any[]
  period?: string
  height?: number
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  period: '12m',
  height: 256,
  loading: false,
  error: ''
})

const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<Chart>()
const colorMode = useColorMode()

// Computed chart configuration
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Equity Curve',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    }
  }

  const labels = props.data.map(item => {
    return new Date(item.trade_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  })

  return {
    labels,
    datasets: [{
      label: 'Equity Curve ($)',
      data: props.data.map(item => parseFloat(item.cumulative_pnl || 0)),
      borderColor: '#3b82f6',
      backgroundColor: colorMode.value === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: colorMode.value === 'dark' ? '#d1d5db' : '#374151',
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: colorMode.value === 'dark' ? '#1f2937' : '#ffffff',
      titleColor: colorMode.value === 'dark' ? '#f3f4f6' : '#111827',
      bodyColor: colorMode.value === 'dark' ? '#d1d5db' : '#374151',
      borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: function(context) {
          const value = context.parsed.y
          const sign = value >= 0 ? '+' : ''
          return `Equity: ${sign}$${value.toFixed(2)}`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        color: colorMode.value === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db'
      },
      ticks: {
        color: colorMode.value === 'dark' ? '#9ca3af' : '#6b7280',
        maxTicksLimit: 8
      }
    },
    y: {
      display: true,
      position: 'left',
      grid: {
        color: colorMode.value === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db'
      },
      ticks: {
        color: colorMode.value === 'dark' ? '#9ca3af' : '#6b7280',
        callback: function(value) {
          return '$' + value.toFixed(0)
        }
      }
    }
  },
  elements: {
    point: {
      hoverBackgroundColor: '#3b82f6'
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}))

// Initialize chart
const initChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  chart.value = new Chart(chartCanvas.value, {
    type: 'line',
    data: chartData.value,
    options: chartOptions.value
  })
}

// Update chart data
const updateChart = () => {
  if (!chart.value) return

  chart.value.data = chartData.value
  chart.value.options = chartOptions.value
  chart.value.update()
}

// Watch for data changes
watch(() => props.data, () => {
  if (chart.value) {
    updateChart()
  }
}, { deep: true })

// Watch for theme changes
watch(() => colorMode.value, () => {
  if (chart.value) {
    updateChart()
  }
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>