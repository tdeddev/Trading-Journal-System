<template>
  <div class="notification-center">
    <!-- Notification Bell Icon -->
    <div class="relative">
      <button
        @click="toggleNotifications"
        class="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Icon name="heroicons:bell" class="w-6 h-6" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Notifications Dropdown -->
      <div
        v-if="showNotifications"
        class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div class="flex items-center space-x-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Mark all read
              </button>
              <button
                @click="showNotifications = false"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-80 overflow-y-auto">
          <div v-if="loading" class="p-4 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>

          <div v-else-if="notifications.length === 0" class="p-8 text-center">
            <Icon name="heroicons:bell-slash" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>

          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.is_read }"
              @click="markAsRead(notification.id)"
            >
              <div class="flex items-start space-x-3">
                <!-- Notification Icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getNotificationIconClass(notification.notification_type)"
                  >
                    <Icon 
                      :name="getNotificationIcon(notification.notification_type)"
                      class="w-4 h-4"
                    />
                  </div>
                </div>

                <!-- Notification Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ notification.title }}
                    </p>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatDate(notification.created_at) }}
                      </span>
                      <button
                        @click.stop="deleteNotification(notification.id)"
                        class="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Icon name="heroicons:x-mark" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ notification.message }}
                  </p>
                  <div v-if="!notification.is_read" class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            @click="loadMoreNotifications"
            :disabled="loadingMore"
            class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50"
          >
            {{ loadingMore ? 'Loading...' : 'Load more' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300"
        :class="toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center"
                :class="getNotificationIconClass(toast.type)"
              >
                <Icon :name="getNotificationIcon(toast.type)" class="w-4 h-4" />
              </div>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ toast.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeToast(toast.id)"
                class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

// State
const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const toasts = ref([])
const currentPage = ref(1)

// Methods
const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && notifications.value.length === 0) {
    await loadNotifications()
  }
}

const loadNotifications = async (page = 1) => {
  try {
    loading.value = page === 1
    loadingMore.value = page > 1

    const response = await $api.get('/notifications', {
      params: { 
        limit: 10,
        offset: (page - 1) * 10
      }
    })

    if (response.success) {
      if (page === 1) {
        notifications.value = response.data
      } else {
        notifications.value.push(...response.data)
      }
      currentPage.value = page
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await $api.get('/notifications/unread-count')
    if (response.success) {
      unreadCount.value = response.data.unread_count
    }
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

const markAsRead = async (notificationId: number) => {
  try {
    const response = await $api.post(`/notifications/mark-read/${notificationId}`)
    if (response.success) {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    const response = await $api.post('/notifications/mark-all-read')
    if (response.success) {
      notifications.value.forEach(notification => {
        if (!notification.is_read) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
        }
      })
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

const deleteNotification = async (notificationId: number) => {
  try {
    const response = await $api.delete(`/notifications/${notificationId}`)
    if (response.success) {
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index > -1) {
        const notification = notifications.value[index]
        if (!notification.is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

const loadMoreNotifications = () => {
  loadNotifications(currentPage.value + 1)
}

const getNotificationIcon = (type: string) => {
  const icons = {
    info: 'heroicons:information-circle',
    success: 'heroicons:check-circle',
    warning: 'heroicons:exclamation-triangle',
    error: 'heroicons:x-circle',
    milestone: 'heroicons:trophy',
    achievement: 'heroicons:star'
  }
  return icons[type] || icons.info
}

const getNotificationIconClass = (type: string) => {
  const classes = {
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    error: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    milestone: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    achievement: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
  }
  return classes[type] || classes.info
}

// Toast notification methods
const showToast = (type: string, title: string, message: string) => {
  const toast = {
    id: Date.now() + Math.random(),
    type,
    title,
    message,
    show: false
  }
  
  toasts.value.push(toast)
  
  // Show toast after a brief delay for animation
  nextTick(() => {
    toast.show = true
  })
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 5000)
}

const removeToast = (toastId: number) => {
  const index = toasts.value.findIndex(t => t.id === toastId)
  if (index > -1) {
    toasts.value[index].show = false
    setTimeout(() => {
      toasts.value.splice(index, 1)
    }, 300)
  }
}

const formatDate = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Click outside to close notifications
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.notification-center')) {
    showNotifications.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUnreadCount()
  document.addEventListener('click', handleClickOutside)
  
  // Poll for new notifications every 30 seconds
  const pollInterval = setInterval(() => {
    loadUnreadCount()
  }, 30000)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    clearInterval(pollInterval)
  })
})

// Expose methods for external use
defineExpose({
  showToast
})
</script>

<style scoped>
/* Additional custom styles can be added here */
</style>