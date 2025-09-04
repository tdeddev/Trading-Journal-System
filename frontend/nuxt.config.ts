// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  
  // CSS configuration
  css: ['~/assets/css/main.css'],
  
  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    apiSecret: process.env.API_SECRET,
    
    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000/api',
      appName: 'Trading Journal System',
      appVersion: '1.0.0'
    }
  },
  
  // App configuration
  app: {
    head: {
      title: 'Trading Journal System',
      titleTemplate: '%s - Trading Journal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Professional Forex & Index Trading Journal System' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },
  
  // Build configuration
  build: {
    transpile: ['chart.js']
  },
  
  // Server-side rendering
  ssr: true,
  
  // Development server
  devServer: {
    port: 3000
  },
  
  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js'
  },
  
  // UI configuration
  ui: {
    global: true,
    icons: ['heroicons', 'simple-icons']
  },
  
  // Pinia configuration
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  },
  
  // Auto imports
  imports: {
    dirs: ['stores']
  }
})