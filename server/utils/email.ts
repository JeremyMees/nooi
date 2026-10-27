const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const section = /\{\{([#^])(\w+)\}\}([\s\S]*?)\{\{\/\2\}\}/g
const rawPlaceholder = /\{\{\{\s*(\w+)\s*\}\}\}/g
const placeholder = /\{\{\s*(\w+)\s*\}\}/g
const maizzleDevServer = 'http://localhost:4321'

export function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, char => htmlEscapes[char]!)
}

function present(value: EmailValue | undefined): boolean {
  return typeof value === 'object' ? !!value.html : !!value
}

function missing(key: string): never {
  throw new Error(`Missing email value for "${key}"`)
}

export function fillEmailTemplate(
  template: string,
  values: Record<string, EmailValue | undefined>,
  format: 'html' | 'text',
): string {
  return template
    .replace(section, (_, kind: string, key: string, content: string) =>
      (kind === '#') === present(values[key]) ? content : '',
    )
    .replace(rawPlaceholder, (_, key: string) => {
      const value = values[key]

      if (typeof value !== 'object') missing(key)

      return value[format]
    })
    .replace(placeholder, (_, key: string) => {
      const value = values[key]

      if (typeof value !== 'string') missing(key)

      return format === 'html' ? escapeHTML(value) : value
    })
}

function fetchFromMaizzleDevServer(
  endpoint: 'render' | 'plaintext',
  template: EmailTemplate,
): Promise<string> {
  return $fetch<string>(
    `${maizzleDevServer}/__maizzle/${endpoint}/app/emails/${template}`,
    { responseType: 'text' },
  )
}

async function loadEmailTemplate(
  template: EmailTemplate,
): Promise<{ html: string; text: string }> {
  if (import.meta.dev) {
    const [html, text] = await Promise.all([
      fetchFromMaizzleDevServer('render', template),
      fetchFromMaizzleDevServer('plaintext', template),
    ])

    return { html, text }
  }

  const storage = useStorage('assets:server')
  const [html, text] = await Promise.all([
    storage.getItem<string>(`emails:${template}.html`),
    storage.getItem<string>(`emails:${template}.txt`),
  ])

  if (!html || !text) {
    throw new Error(`Compiled email template "${template}" not found`)
  }

  return { html, text }
}

export async function renderEmail<T extends EmailTemplate>(
  template: T,
  values: EmailValues[T],
): Promise<{ html: string; text: string }> {
  const { html, text } = await loadEmailTemplate(template)

  return {
    html: fillEmailTemplate(html, values, 'html'),
    text: fillEmailTemplate(text, values, 'text'),
  }
}
