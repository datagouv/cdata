import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

export default defineSitemapEventHandler(async (event) => {
  const config = useRuntimeConfig()

  let { page = 1 } = getQuery(event)
  page = parseInt(page)
  const pageSize = 200
  const nbSitemaps = 10 // should match the datasets sitemaps config in nuxt.config.tst

  // computing starting api datasets page and max page for this sitemap page
  let currentPage = null
  let maxPage = null
  await $fetch<{ path: string }[]>(config.public.apiBase + '/api/1/datasets/', {
    headers: { 'X-Fields': 'total' },
  }).then((result) => {
    const total = result.total
    currentPage = Math.floor((total / nbSitemaps / pageSize)) * (page - 1) + 1
    maxPage = Math.floor((total / nbSitemaps / pageSize)) * page
  })

  let nextPageUrl = config.public.apiBase + `/api/1/datasets/?page_size=${pageSize}&page=${currentPage}`
  const datasets = []

  do {
    await $fetch<{ path: string }[]>(nextPageUrl, {
      headers: { 'X-Fields': 'data{page},next_page,page,total' },
    }).then((result) => {
      nextPageUrl = result.next_page
      currentPage = result.page
      datasets.push(...result.data.map(p => ({
        loc: p.page,
        _sitemap: `datasets_${page}`,
      } satisfies SitemapUrl)))
    })
  } while (nextPageUrl && currentPage <= maxPage)

  return datasets
})
