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
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

interface Props {
  winningTrades?: number
  losingTrades?: number
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  winningTrades: 0,
  losingTrades: 0,
  loading: false,
  error: ''
})

const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<Chart>()
const colorMode = useColorMode()

// Computed chart configuration
const chartData = computed(() => {
  const total = props.winningTrades + props.losingTrades
  
  if (total === 0) {
    return {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#e5e7eb'],
        borderWidth: 0
      }]
    }
  }

  return {
    labels: ['Winning Trades', 'Losing Trades'],
    datasets: [{
      data: [props.winningTrades, props.losingTrades],
      backgroundColor: [
        '#10b981', // Green for wins
        '#ef4444'  // Red for losses
      ],
      borderColor: [
        '#059669',
        '#dc2626'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        '#34d399',
        '#f87171'
      ]
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: colorMode.value === 'dark' ? '#d1d5db' : '#374151',
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: colorMode.value === 'dark' ? '#1f2937' : '#ffffff',
      titleColor: colorMode.value === 'dark' ? '#f3f4f6' : '#111827',
      bodyColor: colorMode.value === 'dark' ? '#d1d5db' : '#374151',
      borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: function(context) {
          const total = props.winningTrades + props.losingTrades
          const value = context.parsed
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
          return `${context.label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  cutout: '50%', // Makes it a donut chart
  animation: {
    animateRotate: true,
    animateScale: false,
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
    type: 'doughnut',
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
watch([() => props.winningTrades, () => props.losingTrades], () => {
  if (chart.value) {
    updateChart()
  }
})

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