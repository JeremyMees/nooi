import { defineFormKitConfig } from '@formkit/vue'
import { genesisIcons } from '@formkit/icons'
import { nl } from '@formkit/i18n'
import { rootClasses } from './theme'
import { createAsteriskPlugin } from './plugins'
import { rules } from './custom-rules'

export default defineFormKitConfig({
  plugins: [createAsteriskPlugin],
  icons: genesisIcons,
  locales: { nl },
  locale: 'nl',
  config: { rootClasses },
  rules
})
