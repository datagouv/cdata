import matter from 'gray-matter'
import { FetchError, ofetch } from 'ofetch'

/**
 * Get the datagouv page based on the path
 * The result is cached for 1h
 */
export default cachedEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const config = useRuntimeConfig()
  const repo = config.pagesGhRepoName
  if (!slug || !repo)
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  const branch = config.pagesGhRepoBranch
  let rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/pages/${slug}`
  let ghUrl = `https://github.com/${repo}/blob/${branch}/pages/${slug}`

  let extension = 'html'
  try {
    const res = await fetch(`${rawUrl}.md`, {
      method: 'HEAD',
    })
    if (res.status == 200) {
      extension = 'md'
    }
  }
  catch {
    extension = 'html'
  }

  rawUrl = `${rawUrl}.${extension}`
  ghUrl = `${ghUrl}.${extension}`

  let response: string
  try {
    response = await ofetch<string>(rawUrl, {
      timeout: 5000,
    })
  }
  catch (error) {
    // GitHub returns a 404 when the page does not exist: return a clean 404
    // instead of letting the error bubble up as a 500.
    if (error instanceof FetchError && error.statusCode === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
    throw error
  }
  const content = matter(response)
  return {
    ghUrl,
    content: content.content,
    data: content.data,
    extension,
  }
}, { maxAge: 1, swr: false })
