import path from 'path'
import vue from '@vitejs/plugin-vue'
import seo from './constants/seo'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@formkit/nuxt',
    '@nuxt/image',
    '@unlok-co/nuxt-stripe',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@primevue/nuxt-module',
    '@nuxtjs/seo',
  ],

  devtools: { enabled: true },

  css: [
    './assets/css/base.css',
    '~/node_modules/primeicons/primeicons.css',
  ],

  site: {
    url: seo.meta.url,
    name: seo.meta.name,
    description: seo.meta.description,
    defaultLocale: 'nl',
  },

  runtimeConfig: {
    url: process.env.NUXT_PUBLIC_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    stripeWebhook: process.env.STRIPE_WEBHOOK,
    public: {
      adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    },
  },

  nitro: {
    rollupConfig: {
      plugins: [vue()],
    },
  },

  eslint: {
    config: { stylistic: true },
  },

  formkit: { configFile: './formkit/config' },

  image: { quality: 80 },

  pinia: { storesDirs: ['./stores/**'] },

  primevue: {
    options: { unstyled: true },
    importPT: { as: 'Lara', from: path.resolve(__dirname, './presets/lara/') },
  },

  robots: {
    disallow: ['/admin'],
  },

  stripe: {
    server: { key: process.env.STRIPE_SK },
    client: { key: process.env.STRIPE_PK },
  },

  supabase: { redirect: false },

  tailwindcss: {
    cssPath: './assets/css/tailwind.css',
    viewer: false,
  },
})
