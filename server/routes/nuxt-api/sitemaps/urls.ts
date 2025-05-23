import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

const API_V2_TYPES = ['dataset']

export default defineSitemapEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const { type, nbSitemapSections = 1 } = getQuery(event)
  if (!type)
    return new Response(null, { status: 404 })
  let { section = 1 } = getQuery(event)
  section = parseInt(section)

  const pageSize = 200
  const selfWebUrlKey = type == 'dataservice' ? 'self_web_url' : 'page'

  // computing starting api page and max page for this sitemap section
  let currentPage = 1
  let maxPage = null
  await $fetch<{ path: string }[]>(`${config.public.apiBase}/api/1/${type}s/`, {
    headers: { 'X-Fields': 'total' },
  }).then((result) => {
    const total = result.total
    currentPage = Math.floor(((total / nbSitemapSections / pageSize)) * (section - 1)) + 1
    maxPage = Math.floor(((total / nbSitemapSections / pageSize)) * section)
    if (section == nbSitemapSections)
      maxPage += 1 // add last incomplete page on the last sitemap
  })

  const apiVersion = API_V2_TYPES.includes(type) ? 2 : 1
  let nextPageUrl = config.public.apiBase + `/api/${apiVersion}/${type}s/?page_size=${pageSize}&page=${currentPage}`
  const pages = []

  do {
    await $fetch<{ path: string }[]>(nextPageUrl, {
      headers: { 'X-Fields': `data{${selfWebUrlKey}},next_page,page,total` },
    }).then((result) => {
      nextPageUrl = result.next_page
      currentPage = result.page
      pages.push(...result.data.map(p => ({
        loc: p[selfWebUrlKey],
        _sitemap: nbSitemapSections == 1 ? `${type}s` : `${type}s_${section}`,
      } satisfies SitemapUrl)))
    })
  } while (nextPageUrl && currentPage < maxPage)

  return pages
})
