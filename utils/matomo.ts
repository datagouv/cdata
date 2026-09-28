import type { RouteLocationNormalizedGeneric } from 'vue-router'

/**
 * Whether Matomo should skip the pageview for this navigation.
 * - matomoIgnore: never track (auth pages, etc.)
 * - matomoSearch: track the arrival pageview, but not query-only changes —
 *   search refinements are tracked as site search actions instead.
 */
export function shouldSkipMatomoPageView(to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedGeneric): boolean {
  if (to.meta.matomoIgnore) return true
  if (to.meta.matomoSearch && to.path === from.path) return true
  return false
}
