import type { Site } from '@datagouv/components-next'

/**
 * Site-wide data, read through the cached server route rather than straight from
 * the API: see `server/routes/nuxt-api/site.get.ts`.
 */
export function useSite() {
  return useFetch<Site>('/nuxt-api/site', { key: 'site' })
}
