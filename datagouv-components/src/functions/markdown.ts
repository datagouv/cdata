import type hast from 'hast'
import behead, { type Options } from 'remark-behead'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { unified, type Processor, type Transformer } from 'unified'
import type { Node } from 'unist'
import { visit } from 'unist-util-visit'
import remarkGfm from 'remark-gfm'
import strip from 'strip-markdown'

// Copied from https://github.com/potato4d/rehype-plugin-image-native-lazy-loading/blob/v1.2.0/src/index.ts
function lazyLoadPlugin(this: Processor): Transformer {
  function visitor(el: hast.Element) {
    if (el.tagName !== 'img') {
      return
    }
    el.properties = {
      ...(el.properties || {}),
      loading: 'lazy',
    }
  }

  function transformer(htmlAST: Node): Node {
    visit(htmlAST, 'element', visitor)
    return htmlAST
  }

  return transformer
}

export function formatMarkdown(md: string, minDepth = 3) {
  const result = unified()
    .use(behead, { minDepth: minDepth > 1 ? minDepth : undefined } as Options)
    // Take Markdown as input and turn it into MD syntax tree
    .use(remarkParse, { fragment: true })
    .use(remarkBreaks)
    .use(remarkGfm)
    // Switch from MD syntax tree to HTML syntax tree (remark -> rehype)
    .use(remarkRehype, {
    // Necessary for support HTML embeds (see next plugin)
      allowDangerousHtml: true,
    })
    // Support HTML embedded inside markdown
    .use(rehypeRaw)
    // Improve code highlighting
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeSanitize)
    // Serialize syntax tree to HTML
    .use(rehypeStringify)
    .use(lazyLoadPlugin)
    // And finally, process the input
    .processSync(md)

  return String(result)
}

export async function removeMarkdown(text: string) {
  const file = await unified()
    .use(remarkGfm)
    .use(strip)
    .process(text)
  return String(file)
}
