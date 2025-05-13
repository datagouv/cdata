import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  return await $fetch<{ path: string }[]>('/api/1/dataservices/?page_size=100', {
    baseURL: config.public.apiBase,
    headers: { 'X-Fields': 'data{self_web_url}' },
  })
    .then(dataservices => dataservices.data.map(p => ({
      loc: p.self_web_url,
      // make sure the dataservice ends up in the dataservices sitemap
      _sitemap: 'dataservices',
    } satisfies SitemapUrl)))
})
