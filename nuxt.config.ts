import path from 'path'
import vue from '@vitejs/plugin-vue'
import seo from './shared/constants/seo'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@formkit/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@sentry/nuxt/module',
    '@nuxt/test-utils/module',
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  site: {
    url: seo.meta.url,
    name: seo.meta.name,
    description: seo.meta.description,
    defaultLocale: 'nl',
  },

  runtimeConfig: {
    url: process.env.NUXT_PUBLIC_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    stripeWebhook: process.env.STRIPE_WEBHOOK,
    stripeSk: process.env.STRIPE_SK,
    cronSecret: process.env.CRON_SECRET,
    reminderEmails: process.env.REMINDER_EMAILS || '',
    adminPassword: process.env.ADMIN_PASSWORD,
    appSecret: process.env.NUXT_APP_SECRET,
    public: {
      sentry: {
        dsn: process.env.SENTRY_DSN,
      },
    },
  },

  compatibilityDate: '2026-03-27',

  sourcemap: {
    client: 'hidden',
    server: false,
  },

  nitro: {
    rollupConfig: {
      plugins: [vue()],
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-kit',
        '@formkit/core',
        '@formkit/icons',
        '@formkit/i18n',
        '@unhead/schema-org/vue',
        '@formkit/tempo',
        '@vue/devtools-core',
        'marked',
      ],
    },
  },

  formkit: { configFile: './formkit/config' },

  image: { quality: 80 },

  pinia: { storesDirs: ['./stores/**'] },

  ui: { colorMode: false },

  fonts: {
    defaults: { weights: [300, 400, 500, 700], subsets: ['latin'] },
    families: [{ name: 'Mukta', provider: 'google' }],
  },

  icon: {
    customCollections: [{ prefix: 'nooi', dir: './app/assets/icons' }],
  },

  robots: {
    disallow: ['/admin'],
  },

  sentry: {
    org: 'kees',
    project: 'nooi',

    sourcemaps: {
      filesToDeleteAfterUpload: ['./.vercel/output/static/**/*.map'],
    },
  },

  sitemap: { zeroRuntime: true },
})
