import path from 'path'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-primevue',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@formkit/nuxt'
  ],
  css: [
    './assets/css/base.css',
    '~/node_modules/primeicons/primeicons.css'
  ],
  supabase: { redirect: false },
  primevue: {
    options: { unstyled: true },
    importPT: { as: 'Lara', from: path.resolve(__dirname, './presets/lara/') }
  },
  tailwindcss: {
    cssPath: './assets/css/tailwind.css',
    viewer: false
  },
  imports: {
    dirs: ['types/*.ts']
  },
  pinia: {
    storesDirs: ['./stores/**']
  },
  formkit: { configFile: './formkit/config' },
  devtools: { enabled: true }
})
