import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  return await $fetch<{ path: string }[]>('/api/1/reuses/?page_size=100', {
    baseURL: config.public.apiBase,
    headers: { 'X-Fields': 'data{page}' },
  })
    .then(reuses => reuses.data.map(p => ({
      loc: p.page,
      // make sure the reuse ends up in the reuses sitemap
      _sitemap: 'reuses',
    } satisfies SitemapUrl)))
})
