import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  const pageSize = 200

  let nextPage = config.public.apiBase + `/api/1/dataservices/?page_size=${pageSize}`
  const dataservices = []

  do {
    await $fetch<{ path: string }[]>(nextPage, {
      headers: { 'X-Fields': 'data{self_web_url},next_page' },
    }).then((result) => {
      nextPage = result.next_page
      dataservices.push(...result.data.map(p => ({
        loc: p.self_web_url,
        _sitemap: 'dataservices',
      } satisfies SitemapUrl)))
    })
  } while (nextPage)

  return dataservices
})
