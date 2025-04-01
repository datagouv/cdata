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
  const branch = config.PagesGhRepoBranch
  let rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/pages/${slug}`
  let ghUrl = `https://github.com/${repo}/blob/${branch}/pages/${slug}`

  let extension = 'html'
  try {
    const res = (await ofetch(`${rawUrl}.md`, {
      method: 'HEAD',
    }))
    if (res.status == 200) {
      extension = 'md'
    }
  }
  catch {
    extension = 'html'
  }

  rawUrl = `${rawUrl}.${extension}`
  ghUrl = `${ghUrl}.${extension}`

  const content = await ofetch<string>(rawUrl, {
    timeout: 5000,
  })

  return {
    ghUrl,
    content,
    extension,
  }
}, { maxAge: 3600 })
