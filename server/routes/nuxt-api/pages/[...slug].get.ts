import matter from 'gray-matter'
import { ofetch } from 'ofetch'

/**
 * Get the datagouv page based on the path
 * The result is cached for 1h
 */
export default cachedEventHandler(async (event) => {
  const slug = event.context.params?.slug
  const config = useRuntimeConfig()
  const repo = config.pagesGhRepoName
  if (!slug || !repo)
    return new Response(null, { status: 404 })
  const branch = config.pagesGhRepoBranch
  let rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/pages/${slug}`
  let ghUrl = `https://github.com/${repo}/blob/${branch}/pages/${slug}`
  console.log(slug)
  console.log(`${rawUrl}.md`)

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

  const response = await ofetch<string>(rawUrl, {
    timeout: 5000,
  })
  const content = matter(response)
  return {
    ghUrl,
    content: content.content,
    data: content.data,
    extension,
  }
}, { maxAge: 1, swr: false })
