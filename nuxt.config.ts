import path from 'path'
import seo from './constants/seo'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-primevue',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@formkit/nuxt',
    '@nuxt/image',
    '@unlok-co/nuxt-stripe',
    '@nuxt/eslint',
    'nuxt-icon',
    '@nuxtjs/seo',
    '@vue-email/nuxt',
  ],
  css: [
    './assets/css/base.css',
    '~/node_modules/primeicons/primeicons.css',
  ],
  runtimeConfig: {
    url: process.env.NUXT_PUBLIC_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    },
  },
  supabase: { redirect: false },
  primevue: {
    options: { unstyled: true },
    importPT: { as: 'Lara', from: path.resolve(__dirname, './presets/lara/') },
  },
  tailwindcss: {
    cssPath: './assets/css/tailwind.css',
    viewer: false,
  },
  imports: { dirs: ['types/*.ts'] },
  pinia: { storesDirs: ['./stores/**'] },
  stripe: {
    server: { key: process.env.STRIPE_SK },
    client: { key: process.env.STRIPE_PK },
  },
  formkit: { configFile: './formkit/config' },
  image: { quality: 80 },
  eslint: {
    config: { stylistic: true },
  },
  site: {
    url: seo.meta.url,
    name: seo.meta.name,
    description: seo.meta.description,
    defaultLocale: 'nl',
  },
  vueEmail: {
    baseUrl: seo.meta.url,
    autoImport: true,
  },
  devtools: { enabled: true },
})
