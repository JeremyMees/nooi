import * as Sentry from '@sentry/nuxt'
import { dataCollection } from './shared/constants/sentry'

Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsn,
  tracesSampleRate: 0.1,
  dataCollection,
  debug: false,
  enabled: !import.meta.dev,
})
