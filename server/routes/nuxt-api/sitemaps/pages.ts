// @ts-expect-error - defineSitemapEventHandler is auto-imported by @nuxtjs/sitemap but types aren't exported
import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'
import type { Post } from '~/types/posts'
import type { PaginatedArray } from '~/types/types'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  // The edito pages are a few dozen: a single page of results holds them all.
  const posts = await $fetch<PaginatedArray<Pick<Post, 'page'>>>('/api/1/posts/', {
    baseURL: config.public.apiBase,
    query: { kind: 'page', page_size: 1000 },
    headers: { 'X-Fields': 'data{page}' },
  })
  return posts.data.map(post => ({
    loc: new URL(post.page).pathname,
    _sitemap: 'pages',
  } satisfies SitemapUrl))
})
