import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  return await $fetch<{ path: string }[]>('/api/1/organizations', {
    baseURL: config.public.apiBase,
    headers: { 'X-Fields': 'data{page}' },
  })
    .then(organizations => organizations.data.map(p => ({
      loc: p.page,
      // make sure the post ends up in the organizations sitemap
      _sitemap: 'organizations',
    } satisfies SitemapUrl)))
})
