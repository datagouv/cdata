import { describe, expect, it } from 'vitest'
import { buildExplorerFeedbackUrl, getSimplifiedUserAgent } from '~/utils/explorer-feedback'

const dataset = {
  id: 'ds-1',
  title: 'Recensement de la population',
  page: 'https://www.data.gouv.fr/fr/datasets/recensement/',
}
const resourceExternalUrl = 'https://www.data.gouv.fr/fr/datasets/recensement/?resource_id=res-1'
const resourceFormat = 'csv'
const simplifiedUserAgent = 'Firefox - desktop'

describe('buildExplorerFeedbackUrl', () => {
  it('appends all six context params to the base URL', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://example.com/feedback', { dataset, resourceExternalUrl, resourceFormat, simplifiedUserAgent }))

    expect(url.searchParams.get('dataset_id')).toBe('ds-1')
    expect(url.searchParams.get('dataset_url')).toBe('https://www.data.gouv.fr/fr/datasets/recensement/')
    expect(url.searchParams.get('dataset_name')).toBe('Recensement de la population')
    expect(url.searchParams.get('url_ressource')).toBe('https://www.data.gouv.fr/fr/datasets/recensement/?resource_id=res-1')
    expect(url.searchParams.get('format_ressource')).toBe('csv')
    expect(url.searchParams.get('navigateur_appareil')).toBe(simplifiedUserAgent)
  })

  it('keeps query params already present in the base URL', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://example.com/feedback?source=banner', { dataset, resourceExternalUrl, resourceFormat, simplifiedUserAgent }))

    expect(url.searchParams.get('source')).toBe('banner')
    expect(url.searchParams.get('dataset_id')).toBe('ds-1')
  })

  it('omits resource params when no resource is resolved yet', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://example.com/feedback', { dataset, resourceExternalUrl: null, resourceFormat: null, simplifiedUserAgent }))

    expect(url.searchParams.has('url_ressource')).toBe(false)
    expect(url.searchParams.has('format_ressource')).toBe(false)
    expect(url.searchParams.get('dataset_id')).toBe('ds-1')
  })

  it('omits navigateur_appareil during SSR (no user agent)', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://example.com/feedback', { dataset, resourceExternalUrl, resourceFormat, simplifiedUserAgent: null }))

    expect(url.searchParams.has('navigateur_appareil')).toBe(false)
  })

  it('returns the base URL unchanged when it is not a valid absolute URL', () => {
    expect(buildExplorerFeedbackUrl('/relative/path', { dataset, resourceExternalUrl, resourceFormat, simplifiedUserAgent })).toBe('/relative/path')
  })
})

describe('getSimplifiedUserAgent', () => {
  it('detects Firefox on desktop', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0')).toBe('Firefox - desktop')
  })

  it('detects Chrome on desktop', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36')).toBe('Chrome - desktop')
  })

  it('detects Safari on mobile', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')).toBe('Safari - mobile')
  })

  it('detects Edge on tablet', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0 Tablet PC')).toBe('Edge - tablet')
  })

  it('detects Android phone as mobile', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36')).toBe('Chrome - mobile')
  })

  it('detects Android tablet without an explicit Tablet token', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36')).toBe('Chrome - tablet')
  })

  it('falls back to Other for unknown browsers', () => {
    expect(getSimplifiedUserAgent('Mozilla/5.0 (X11; Linux x86_64) SomeUnknownBrowser/1.0')).toBe('Other - desktop')
  })
})
