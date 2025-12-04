import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'
import type { H3Event } from 'h3'

const API_V2_TYPES = ['dataset']

interface TotalResponse {
  total: number
}

interface PaginatedResponse {
  data: Array<Record<string, string>>
  next_page: string | null
  page: number
  total: number
}

export default defineSitemapEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()

  const { type, nbSitemapSections = 1 } = getQuery(event)
  if (!type)
    return new Response(null, { status: 404 })
  let { section = 1 } = getQuery(event)
  section = parseInt(String(section))
  const nbSections = parseInt(String(nbSitemapSections))

  const pageSize = 200
  const selfWebUrlKey = type == 'dataservice' ? 'self_web_url' : 'page'

  // computing starting api page and max page for this sitemap section
  let currentPage = 1
  let maxPage = 1
  await $fetch<TotalResponse>(`${config.public.apiBase}/api/1/${type}s/`, {
    headers: { 'X-Fields': 'total' },
  }).then((result) => {
    const total = result.total
    currentPage = Math.floor(((total / nbSections / pageSize)) * (section - 1)) + 1
    maxPage = Math.floor(((total / nbSections / pageSize)) * section)
    if (section == nbSections)
      maxPage += 1 // add last incomplete page on the last sitemap
  })

  const apiVersion = API_V2_TYPES.includes(String(type)) ? 2 : 1
  let nextPageUrl: string | null = config.public.apiBase + `/api/${apiVersion}/${type}s/?page_size=${pageSize}&page=${currentPage}`
  const pages: SitemapUrl[] = []

  do {
    await $fetch<PaginatedResponse>(nextPageUrl, {
      headers: { 'X-Fields': `data{${selfWebUrlKey}},next_page,page,total` },
    }).then((result) => {
      nextPageUrl = result.next_page
      currentPage = result.page
      pages.push(...result.data.map((p: Record<string, string>) => ({
        loc: p[selfWebUrlKey],
        _sitemap: nbSections == 1 ? `${type}s` : `${type}s_${section}`,
      } satisfies SitemapUrl)))
    })
  } while (nextPageUrl && currentPage < maxPage)

  return pages
})
