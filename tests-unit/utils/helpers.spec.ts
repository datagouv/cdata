import { afterEach, describe, expect, it, vi } from 'vitest'
import { humanJoin, redirectLegacyHashes, removeLangPrefix, useIsCurrentTab } from '~/utils/helpers'

describe('removeLangPrefix', () => {
  it('removes a language prefix', () => {
    expect(removeLangPrefix('/fr/datasets')).toEqual('/datasets')
    expect(removeLangPrefix('/en/datasets')).toEqual('/datasets')
    expect(removeLangPrefix('/fr')).toEqual('')
  })

  it('does not eat "en" or "fr" inside the path', () => {
    // Regression: the previous regex removed the first "en" found anywhere
    expect(removeLangPrefix('/datasets/recensement')).toEqual('/datasets/recensement')
    expect(removeLangPrefix('/friends')).toEqual('/friends')
    expect(removeLangPrefix('/envies')).toEqual('/envies')
    expect(removeLangPrefix('/')).toEqual('/')
  })
})

describe('humanJoin', () => {
  it('joins with French rules', () => {
    expect(humanJoin([])).toEqual('')
    expect(humanJoin(['a'])).toEqual('a')
    expect(humanJoin(['a', 'b'])).toEqual('a et b')
    expect(humanJoin(['a', 'b', 'c'])).toEqual('a, b et c')
  })

  it('does not mutate the source array', () => {
    const source = ['a', 'b', 'c']
    humanJoin(source)
    expect(source).toEqual(['a', 'b', 'c'])
  })
})

describe('useIsCurrentTab', () => {
  const setup = (fullPath: string, links: Array<{ href: string }>) => {
    vi.stubGlobal('useRoute', () => ({ fullPath }))
    vi.stubGlobal('useRequestURL', () => new URL('https://www.data.gouv.fr/'))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'https://www.data.gouv.fr' } }))
    return useIsCurrentTab(links)
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const datasetTabs = [
    { href: '/datasets/slug' },
    { href: '/datasets/slug/discussions' },
  ]

  it('selects the tab matching the current path', () => {
    let isCurrentTab = setup('/datasets/slug', datasetTabs)
    expect(isCurrentTab('/datasets/slug')).toBe(true)
    expect(isCurrentTab('/datasets/slug/discussions')).toBe(false)

    isCurrentTab = setup('/datasets/slug/discussions', datasetTabs)
    expect(isCurrentTab('/datasets/slug')).toBe(false)
    expect(isCurrentTab('/datasets/slug/discussions')).toBe(true)
  })

  it('keeps the tab selected when the page adds its own query params', () => {
    const isCurrentTab = setup('/datasets/slug?resource_id=abc-123&page=2', datasetTabs)
    expect(isCurrentTab('/datasets/slug')).toBe(true)
    expect(isCurrentTab('/datasets/slug/discussions')).toBe(false)
  })

  it('still discriminates on the query params the tabs themselves set', () => {
    const moderationTabs = [
      { href: '/admin/site/moderation' },
      { href: '/admin/site/moderation?type=Dataset' },
      { href: '/admin/site/moderation?type=Reuse' },
    ]

    let isCurrentTab = setup('/admin/site/moderation?type=Dataset&page=3', moderationTabs)
    expect(isCurrentTab('/admin/site/moderation')).toBe(false)
    expect(isCurrentTab('/admin/site/moderation?type=Dataset')).toBe(true)
    expect(isCurrentTab('/admin/site/moderation?type=Reuse')).toBe(false)

    isCurrentTab = setup('/admin/site/moderation?page=3', moderationTabs)
    expect(isCurrentTab('/admin/site/moderation')).toBe(true)
    expect(isCurrentTab('/admin/site/moderation?type=Dataset')).toBe(false)
  })

  it('accepts absolute urls and trailing slashes', () => {
    const isCurrentTab = setup('/datasets/slug?resource_id=abc-123', datasetTabs)
    expect(isCurrentTab('https://www.data.gouv.fr/datasets/slug/')).toBe(true)
  })
})

describe('redirectLegacyHashes', () => {
  const instructions = [
    { from: 'discussions', to: '/datasets/slug/discussions', queryParam: 'discussion_id' },
    { from: 'resources', to: '/datasets/slug', queryParam: 'resource_id' },
  ]

  const setup = (hash: string) => {
    const navigateTo = vi.fn()
    vi.stubGlobal('useRoute', () => ({ hash }))
    vi.stubGlobal('navigateTo', navigateTo)
    return navigateTo
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects an exact `#/section` hash', async () => {
    const navigateTo = setup('#/discussions')
    await redirectLegacyHashes(instructions)
    expect(navigateTo).toHaveBeenCalledExactlyOnceWith('/datasets/slug/discussions', { redirectCode: 301 })
  })

  it('extracts the id from a `#/section/id` hash into the query param', async () => {
    const navigateTo = setup('#/discussions/abc-123')
    await redirectLegacyHashes(instructions)
    expect(navigateTo).toHaveBeenCalledExactlyOnceWith(
      { path: '/datasets/slug/discussions', query: { discussion_id: 'abc-123' } },
      { redirectCode: 301 },
    )
  })

  it('extracts the id from a `#section-id` hash into the query param', async () => {
    const navigateTo = setup('#resources-abc-123')
    await redirectLegacyHashes(instructions)
    expect(navigateTo).toHaveBeenCalledExactlyOnceWith(
      { path: '/datasets/slug', query: { resource_id: 'abc-123' } },
      { redirectCode: 301 },
    )
  })

  it('does nothing without a hash or with an unknown hash', async () => {
    let navigateTo = setup('')
    await redirectLegacyHashes(instructions)
    expect(navigateTo).not.toHaveBeenCalled()

    navigateTo = setup('#something-else')
    await redirectLegacyHashes(instructions)
    expect(navigateTo).not.toHaveBeenCalled()
  })
})
