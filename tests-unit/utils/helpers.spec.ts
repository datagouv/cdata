import { afterEach, describe, expect, it, vi } from 'vitest'
import { humanJoin, redirectLegacyHashes, removeLangPrefix } from '~/utils/helpers'

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
