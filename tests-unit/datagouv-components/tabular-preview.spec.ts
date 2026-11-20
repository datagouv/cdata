import { describe, expect, it } from 'vitest'
import { getTabularPreviewDate, isTabularPreviewStale } from '~/datagouv-components/src/functions/tabularPreview'

const ANALYSED_AT = '2026-06-01T10:00:00+00:00'

function resource(lastModified: string, finishedAt?: string) {
  return {
    last_modified: lastModified,
    extras: finishedAt ? { 'analysis:parsing:finished_at': finishedAt } : {},
  }
}

describe('getTabularPreviewDate', () => {
  it('is the end of the last analysis', () => {
    expect(getTabularPreviewDate(resource('2026-05-01T00:00:00+00:00', ANALYSED_AT))).toBe(ANALYSED_AT)
  })

  it('is undefined for a file never analysed', () => {
    expect(getTabularPreviewDate(resource('2026-05-01T00:00:00+00:00'))).toBeUndefined()
  })
})

describe('isTabularPreviewStale', () => {
  it('is not stale when the file changed before the analysis', () => {
    expect(isTabularPreviewStale(resource('2026-05-31T23:59:59+00:00', ANALYSED_AT))).toBe(false)
  })

  it('is stale when the file changed after the analysis', () => {
    expect(isTabularPreviewStale(resource('2026-06-08T09:00:00+00:00', ANALYSED_AT))).toBe(true)
  })

  it('is not stale without an analysis', () => {
    expect(isTabularPreviewStale(resource('2026-06-08T09:00:00+00:00'))).toBe(false)
  })
})
