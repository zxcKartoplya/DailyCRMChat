// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  devServer: {
    	host: '0.0.0.0',
    	port: 3000,
  	},

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api',
    },
  },

  typescript: {
    strict: true,
  },
})
