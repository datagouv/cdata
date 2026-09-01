import { describe, expect, it } from 'vitest'
import { buildExplorerFeedbackUrl } from '~/utils/explorer-feedback'

const dataset = {
  id: 'ds-1',
  title: 'Recensement de la population',
  page: 'https://www.data.gouv.fr/fr/datasets/recensement/',
}
const resource = {
  url: 'https://example.com/data.csv?x=1&y=2',
  format: 'csv',
}
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) Firefox/141.0'

describe('buildExplorerFeedbackUrl', () => {
  it('appends all six context params to the base URL', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://tally.so/r/form', { dataset, resource, userAgent }))

    expect(url.searchParams.get('dataset_id')).toBe('ds-1')
    expect(url.searchParams.get('dataset_url')).toBe('https://www.data.gouv.fr/fr/datasets/recensement/')
    expect(url.searchParams.get('dataset_name')).toBe('Recensement de la population')
    expect(url.searchParams.get('url_ressource')).toBe('https://example.com/data.csv?x=1&y=2')
    expect(url.searchParams.get('format_ressource')).toBe('csv')
    expect(url.searchParams.get('navigateur_appareil')).toBe(userAgent)
  })

  it('keeps query params already present in the base URL', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://tally.so/r/form?source=banner', { dataset, resource, userAgent }))

    expect(url.searchParams.get('source')).toBe('banner')
    expect(url.searchParams.get('dataset_id')).toBe('ds-1')
  })

  it('omits resource params when no resource is resolved yet', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://tally.so/r/form', { dataset, resource: null, userAgent }))

    expect(url.searchParams.has('url_ressource')).toBe(false)
    expect(url.searchParams.has('format_ressource')).toBe(false)
    expect(url.searchParams.get('dataset_id')).toBe('ds-1')
  })

  it('omits navigateur_appareil during SSR (no user agent)', () => {
    const url = new URL(buildExplorerFeedbackUrl('https://tally.so/r/form', { dataset, resource, userAgent: null }))

    expect(url.searchParams.has('navigateur_appareil')).toBe(false)
  })

  it('returns the base URL unchanged when it is not a valid absolute URL', () => {
    expect(buildExplorerFeedbackUrl('/relative/path', { dataset, resource, userAgent })).toBe('/relative/path')
  })
})
