import { Marked } from 'marked'
import type { Tokens } from 'marked'

const safeUrl = /^(https?:|mailto:|tel:|\/|#|[^:]*$)/i

const markdown = new Marked({
  async: false,
  gfm: true,
  renderer: {
    html: () => '',
    link(token: Tokens.Link) {
      return safeUrl.test(token.href.trim())
        ? false
        : this.parser.parseInline(token.tokens)
    },
    image(token: Tokens.Image) {
      return safeUrl.test(token.href.trim()) ? false : ''
    },
  },
})

export function renderMarkdown(source: string): string {
  return markdown.parse(source) as string
}
