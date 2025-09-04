<template>
  <div class="image-upload-container">
    <!-- Upload Area -->
    <div 
      class="upload-dropzone"
      :class="{ 
        'drag-over': isDragOver,
        'uploading': uploading
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
      
      <div v-if="!uploading" class="upload-content">
        <Icon name="heroicons:photo" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Upload Trade Images
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop images here, or click to select files
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-500">
          PNG, JPG, GIF, WebP up to 10MB each. Max 5 images.
        </p>
      </div>
      
      <div v-else class="upload-content">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p class="text-lg font-medium text-gray-900 dark:text-white">
          Uploading {{ uploadProgress.current }} of {{ uploadProgress.total }}...
        </p>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${uploadProgress.percent}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <div class="flex">
        <Icon name="heroicons:x-circle" class="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-red-800 dark:text-red-400">{{ error }}</p>
      </div>
    </div>
    
    <!-- Success Message -->
    <div v-if="success" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <div class="flex">
        <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-green-800 dark:text-green-400">{{ success }}</p>
      </div>
    </div>
    
    <!-- Image Preview Grid -->
    <div v-if="images.length > 0" class="mt-6">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Trade Images ({{ images.length }})
      </h4>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="image in images" 
          :key="image.id"
          class="relative group"
        >
          <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img 
              :src="getImageUrl(image.thumbnail_path)"
              :alt="image.original_filename"
              class="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
              @click="openImage(image)"
            />
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="deleteImage(image.id)"
                  class="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  title="Delete image"
                >
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>
              </div>
              
              <div class="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openImage(image)"
                  class="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="View full size"
                >
                  <Icon name="heroicons:magnifying-glass-plus" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ image.original_filename }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Image Modal -->
    <div 
      v-if="selectedImage" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click="closeImageModal"
    >
      <div class="max-w-4xl max-h-full p-4">
        <img 
          :src="getImageUrl(selectedImage.file_path)"
          :alt="selectedImage.original_filename"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        <div class="text-center mt-4">
          <p class="text-white text-lg font-medium">{{ selectedImage.original_filename }}</p>
          <button 
            @click="closeImageModal"
            class="mt-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  tradeId: string | number
}

const props = defineProps<Props>()

const { $api } = useNuxtApp()

// State
const uploading = ref(false)
const error = ref('')
const success = ref('')
const isDragOver = ref(false)
const images = ref([])
const selectedImage = ref(null)

const uploadProgress = reactive({
  current: 0,
  total: 0,
  percent: 0
})

// Refs
const fileInput = ref<HTMLInputElement>()

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadFiles(Array.from(target.files))
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  if (e.dataTransfer?.files) {
    uploadFiles(Array.from(e.dataTransfer.files))
  }
}

const uploadFiles = async (files: File[]) => {
  error.value = ''
  success.value = ''
  
  // Validate files
  const validFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select only image files'
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      error.value = 'Images must be smaller than 10MB'
      return false
    }
    return true
  })
  
  if (validFiles.length === 0) return
  
  if (validFiles.length > 5) {
    error.value = 'Maximum 5 images allowed'
    return
  }
  
  uploading.value = true
  uploadProgress.current = 0
  uploadProgress.total = validFiles.length
  uploadProgress.percent = 0
  
  try {
    const formData = new FormData()
    validFiles.forEach(file => {
      formData.append('images', file)
    })
    
    const response = await $api.post(`/trades/${props.tradeId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })
    
    if (response.success) {
      success.value = response.message
      await loadImages()
      
      // Clear file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    } else {
      error.value = response.message || 'Upload failed'
    }
  } catch (err) {
    error.value = err.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}

const loadImages = async () => {
  try {
    const response = await $api.get(`/trades/${props.tradeId}/images`)
    if (response.success) {
      images.value = response.data
    }
  } catch (err) {
    console.error('Failed to load images:', err)
  }
}

const deleteImage = async (imageId: string | number) => {
  if (!confirm('Are you sure you want to delete this image?')) return
  
  try {
    const response = await $api.delete(`/trades/images/${imageId}`)
    if (response.success) {
      await loadImages()
      success.value = 'Image deleted successfully'
      setTimeout(() => success.value = '', 3000)
    } else {
      error.value = response.message || 'Delete failed'
    }
  } catch (err) {
    error.value = err.message || 'Delete failed'
  }
}

const openImage = (image: any) => {
  selectedImage.value = image
}

const closeImageModal = () => {
  selectedImage.value = null
}

const getImageUrl = (path: string) => {
  const config = useRuntimeConfig()
  return `${config.public.apiBase}${path}`
}

// Load images on mount
onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.upload-dropzone {
  @apply border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-all;
}

.upload-dropzone:hover {
  @apply border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20;
}

.upload-dropzone.drag-over {
  @apply border-blue-500 bg-blue-100 dark:bg-blue-800/30;
}

.upload-dropzone.uploading {
  @apply cursor-not-allowed bg-gray-50 dark:bg-gray-800;
}

.upload-content {
  @apply pointer-events-none;
}
</style>