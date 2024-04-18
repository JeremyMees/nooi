import path from 'path'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-primevue',
    '@vueuse/nuxt'
  ],
  css: [
    '~/assets/css/base.css',
    '~/node_modules/primeicons/primeicons.css'
  ],
  primevue: {
    options: { unstyled: true },
    importPT: { as: 'Lara', from: path.resolve(__dirname, './presets/lara/') }
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    viewer: false
  },
  devtools: { enabled: true }
})
