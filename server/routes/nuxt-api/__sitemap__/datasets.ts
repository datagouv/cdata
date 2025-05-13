import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  return await $fetch<{ path: string }[]>('/api/1/datasets/?page_size=100', {
    baseURL: config.public.apiBase,
    headers: { 'X-Fields': 'data{page}' },
  })
    .then(datasets => datasets.data.map(p => ({
      loc: p.page,
      // make sure the dataset ends up in the datasets sitemap
      _sitemap: 'datasets',
    } satisfies SitemapUrl)))
})
