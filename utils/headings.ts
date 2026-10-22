import type { Element, Root } from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import { toString } from 'hast-util-to-string'

export type Heading = {
  id: string
  label: string
  level: number
}

export function slugify(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function* headingElements(node: Root | Element): Generator<Element> {
  for (const child of node.children) {
    if (child.type !== 'element') continue
    if (child.tagName === 'h2' || child.tagName === 'h3' || child.tagName === 'h4') yield child
    else yield* headingElements(child)
  }
}

// Read from the HTML rather than the DOM so that the side menu is complete in the
// server-side render. Headings without an id get one: the returned HTML is the one
// to render for their anchors to exist.
export function anchorHeadings(html: string): { html: string, headings: Array<Heading> } {
  const tree = fromHtml(html, { fragment: true })
  const headings: Array<Heading> = []
  for (const element of headingElements(tree)) {
    const label = toString(element).trim()
    if (!label) continue
    element.properties.id ??= slugify(label) || 'section'
    headings.push({ id: String(element.properties.id), label, level: Number(element.tagName[1]) })
  }
  return { html: toHtml(tree), headings }
}
