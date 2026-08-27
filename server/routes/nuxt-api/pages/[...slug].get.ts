import matter from 'gray-matter'
import { FetchError, ofetch } from 'ofetch'

type Page = {
  ghUrl: string
  content: string
  data: Record<string, unknown>
  extension: string
}

// Extensions are tried in order: a page exists as either a Markdown or an HTML file.
const EXTENSIONS = ['md', 'html'] as const

/**
 * Fetch a datagouv page from the GitHub repository holding them.
 * Returns `null` when the page does not exist there.
 *
 * The result is cached for 1h and served stale while revalidating, so that
 * raw.githubusercontent.com being slow or unreachable never reaches the visitor.
 * `null` is cached too, otherwise unknown slugs (crawlers, dead links) hit GitHub
 * on every single request.
 */
const fetchPage = defineCachedFunction(async (repo: string, branch: string, slug: string): Promise<Page | null> => {
  for (const extension of EXTENSIONS) {
    let response: string
    try {
      response = await ofetch<string>(`https://raw.githubusercontent.com/${repo}/${branch}/pages/${slug}.${extension}`, {
        timeout: 5000,
      })
    }
    catch (error) {
      if (error instanceof FetchError && error.statusCode === 404) continue
      throw error
    }

    const content = matter(response)
    return {
      ghUrl: `https://github.com/${repo}/blob/${branch}/pages/${slug}.${extension}`,
      content: content.content,
      data: content.data,
      extension,
    }
  }

  return null
}, { name: 'gh-page', maxAge: 3600, swr: true })

/**
 * Get the datagouv page based on the path
 */
export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const config = useRuntimeConfig()
  const repo = config.pagesGhRepoName
  if (!slug || !repo)
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })

  const page = await fetchPage(repo, config.pagesGhRepoBranch, slug)
  if (!page)
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })

  return page
})
