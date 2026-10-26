import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '~~/shared/utils/markdown'

describe('renderMarkdown', () => {
  it('renders headings, emphasis and lists', () => {
    const html = renderMarkdown(
      '## Kom schilderen\n\nNeem je **eigen** penseel\n\n- koffie',
    )

    expect(html).toContain('<h2>Kom schilderen</h2>')
    expect(html).toContain('<strong>eigen</strong>')
    expect(html).toContain('<li>koffie</li>')
  })

  it('keeps web, mail and phone links', () => {
    expect(renderMarkdown('[site](https://nooi.be)')).toContain(
      '<a href="https://nooi.be">site</a>',
    )
    expect(renderMarkdown('[mail](mailto:zin@nooi.be)')).toContain(
      'href="mailto:zin@nooi.be"',
    )
    expect(renderMarkdown('[info](/info)')).toContain('href="/info"')
  })

  it('drops raw html', () => {
    const html = renderMarkdown(
      'Hallo <script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n<iframe src="https://evil.example"></iframe>',
    )

    expect(html).not.toMatch(/<script|onerror|<iframe|<img/i)
    expect(html).toContain('Hallo')
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
  ])('strips the target of a %s link', href => {
    const html = renderMarkdown(`[klik](${href})`)

    expect(html).not.toContain('href=')
    expect(html).toContain('klik')
  })

  it('drops images with an unsafe source', () => {
    expect(renderMarkdown('![x](javascript:alert(1))')).not.toContain('<img')
    expect(renderMarkdown('![foto](https://nooi.be/a.jpg)')).toContain(
      '<img src="https://nooi.be/a.jpg" alt="foto">',
    )
  })

  it('escapes html inside text', () => {
    expect(renderMarkdown('1 < 2 & `<b>`')).toContain('&lt;b&gt;')
  })
})
