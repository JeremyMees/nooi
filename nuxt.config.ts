import path from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import seo from './constants/seo'

export default defineNuxtConfig({

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@formkit/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@primevue/nuxt-module',
    '@nuxtjs/seo',
  ],

  devtools: { enabled: true },

  css: [
    './assets/css/main.css',
    '~~/node_modules/primeicons/primeicons.css',
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
    stripeSk: process.env.STRIPE_SK,
    qStashUrl: process.env.QSTASH_URL,
    qStashToken: process.env.QSTASH_TOKEN,
    public: {
      adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    },
  },

  compatibilityDate: '2026-03-27',

  nitro: {
    rollupConfig: {
      plugins: [vue()],
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@vue/devtools-kit',
        '@formkit/core',
        '@formkit/icons',
        '@formkit/i18n',
        '@kangc/v-md-editor', // CJS
        '@kangc/v-md-editor/lib/theme/github.js', // CJS
        '@kangc/v-md-editor/lib/lang/en-US', // CJS
        'highlight.js', // CJS
        '@unhead/schema-org/vue',
        '@formkit/tempo',
      ],
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
    importPT: { as: 'Lara', from: '~~/presets/lara/' },
  },

  robots: {
    disallow: ['/admin'],
  },

  supabase: {
    redirect: false,
    types: '../shared/types/database.ts',
  },
})
