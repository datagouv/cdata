import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  return await $fetch<{ path: string }[]>('/api/1/posts/?page_size=100', {
    baseURL: config.public.apiBase,
    headers: { 'X-Fields': 'data{page}' },
  })
    .then(posts => posts.data.map(p => ({
      loc: p.page,
      // make sure the post ends up in the posts sitemap
      _sitemap: 'posts',
    } satisfies SitemapUrl)))
})
