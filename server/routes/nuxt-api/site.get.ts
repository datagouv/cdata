import type { Site } from '@datagouv/components-next'

/**
 * Site-wide data: the udata version shown by the footer on every page, and the
 * counters shown on the homepage. It is identical for every visitor and the
 * backend refreshes the counters once a day, so it is cached here: one call to
 * udata per minute instead of one per rendered page.
 */
export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  return await $fetch<Site>('/api/1/site/', { baseURL: config.public.apiBase })
}, { maxAge: 60, swr: false })
