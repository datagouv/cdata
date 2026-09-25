import { describe, expect, it } from 'vitest'
import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { shouldSkipMatomoPageView } from '~/utils/matomo'

function makeRoute(path: string, meta: Record<string, unknown>): RouteLocationNormalizedGeneric {
  return { path, fullPath: path, meta } as RouteLocationNormalizedGeneric
}

describe('shouldSkipMatomoPageView', () => {
  it('skips routes with matomoIgnore', () => {
    const to = makeRoute('/login', { matomoIgnore: true })
    const from = makeRoute('/', {})
    expect(shouldSkipMatomoPageView(to, from)).toBe(true)
  })

  it('skips query-only changes on matomoSearch routes', () => {
    const to = makeRoute('/datasets/search', { matomoSearch: true })
    const from = makeRoute('/datasets/search', { matomoSearch: true })
    expect(shouldSkipMatomoPageView(to, from)).toBe(true)
  })

  it('keeps the arrival pageview on matomoSearch routes', () => {
    const to = makeRoute('/datasets/search', { matomoSearch: true })
    const from = makeRoute('/', {})
    expect(shouldSkipMatomoPageView(to, from)).toBe(false)
  })

  it('keeps normal navigations', () => {
    const to = makeRoute('/datasets/xyz', {})
    const from = makeRoute('/datasets/search', {})
    expect(shouldSkipMatomoPageView(to, from)).toBe(false)
  })
})
