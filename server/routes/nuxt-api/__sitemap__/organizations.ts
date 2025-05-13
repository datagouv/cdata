import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()

  const pageSize = 200

  let nextPage = config.public.apiBase + `/api/1/organizations/?page_size=${pageSize}`
  const organizations = []

  do {
    await $fetch<{ path: string }[]>(nextPage, {
      headers: { 'X-Fields': 'data{page},next_page' },
    }).then((result) => {
      nextPage = result.next_page
      organizations.push(...result.data.map(p => ({
        loc: p.page,
        _sitemap: 'organizations',
      } satisfies SitemapUrl)))
    })
  } while (nextPage)

  return organizations
})
