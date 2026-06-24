import { describe, expect, it } from 'vitest'
import { formatMarkdown, removeMarkdownSync } from '~/datagouv-components/src/functions/markdown'

// Targeted property assertions, no full HTML snapshots: snapshots would break
// on every remark/rehype upgrade without telling us anything.
describe('formatMarkdown', () => {
  it('sanitizes embedded HTML (XSS)', () => {
    const html = formatMarkdown('Hello <script>alert(1)</script><img src=x onerror="alert(1)">')
    expect(html).toContain('Hello')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('normalizes the smallest heading of the document to minDepth (default 3)', () => {
    expect(formatMarkdown('# Title')).toContain('<h3')
    expect(formatMarkdown('# Title', 2)).toContain('<h2')

    // behead shifts the whole document so its smallest heading lands on
    // minDepth — it is not a fixed per-level offset
    const html = formatMarkdown('# Title\n\n## Subtitle', 2)
    expect(html).toContain('<h2')
    expect(html).toContain('<h3')
    expect(formatMarkdown('## Alone', 2)).toContain('<h2')
  })

  it('keeps h1 when minDepth is 1', () => {
    expect(formatMarkdown('# Title', 1)).toContain('<h1')
  })

  it('replaces headings with styled divs when noHeadings is set', () => {
    const html = formatMarkdown('# Title', { minDepth: 1, noHeadings: true })
    expect(html).not.toMatch(/<h[1-6]/)
    expect(html).toContain('<div')
    expect(html).toContain('font-extrabold')
    expect(html).toContain('Title')
  })

  it('adds lazy loading to images', () => {
    const html = formatMarkdown('![alt](https://example.com/image.png)')
    expect(html).toContain('loading="lazy"')
  })

  it('renders GFM tables', () => {
    const html = formatMarkdown('| a | b |\n| - | - |\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<td>1</td>')
  })
})

describe('removeMarkdownSync', () => {
  it('strips the markup and keeps the text', () => {
    expect(removeMarkdownSync('**bold** and [a link](https://example.com)').trim()).toEqual('bold and a link')
  })
})
