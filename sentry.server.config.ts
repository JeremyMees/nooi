import * as Sentry from '@sentry/nuxt'
import { dataCollection } from './shared/constants/sentry'

Sentry.init({
  tracesSampleRate: 0.1,
  dataCollection,
  debug: false,
  enabled: !import.meta.dev,
})
