import path from 'path'

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
  ],
  css: [
    './assets/css/base.css',
    '~/node_modules/primeicons/primeicons.css',
  ],
  runtimeConfig: { url: process.env.NUXT_PUBLIC_URL },
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
  devtools: { enabled: true },
})
