import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const repo = config.pagesGhRepoName
  if (!repo)
    return new Response(null, { status: 404 })
  const contentUrl = `https://api.github.com/repos/${repo}/git/trees/master?recursive=true`
  // The limit for the tree array is 100,000 entries with a maximum size of 7 MB
  // when using the recursive parameter.

  return await $fetch<{ path: string, type: string }[]>(contentUrl, {
    headers: { Accept: 'application/vnd.github+json' },
  }).then((result) => {
    return result.tree
      .filter(
        p => p.type === 'blob' && p.path.startsWith('pages/') && (p.path.endsWith('.html') || p.path.endsWith('.md')),
      )
      .map(p => ({
        loc: `/${p.path.slice(0, p.path.lastIndexOf('.'))}/`,
        _sitemap: 'pages',
      } satisfies SitemapUrl))
  })
})
