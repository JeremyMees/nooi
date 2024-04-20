import { defineFormKitConfig } from '@formkit/vue'
import { genesisIcons } from '@formkit/icons'
import { nl } from '@formkit/i18n'
import { rootClasses } from './formkit.theme'
import { createAsteriskPlugin } from './formkit.plugins'

export default defineFormKitConfig({
  plugins: [createAsteriskPlugin],
  icons: genesisIcons,
  locales: { nl },
  locale: 'nl',
  config: { rootClasses }
})
