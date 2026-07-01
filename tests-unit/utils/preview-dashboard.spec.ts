import { describe, expect, it } from 'vitest'
import { buildFiltersFromQuery, buildQueryFromFilters } from '~/utils/previewDashboard'

describe('buildFiltersFromQuery', () => {
  it('returns empty filters when format is missing', () => {
    expect(buildFiltersFromQuery({})).toEqual({})
  })

  it('maps a single format to an in filter', () => {
    expect(buildFiltersFromQuery({ format: 'csv' })).toEqual({
      'format normalisé': { in: ['csv'] },
    })
  })

  it('maps an array of formats to an __in filter', () => {
    expect(buildFiltersFromQuery({ format: ['csv', 'xlsx'] })).toEqual({
      'format normalisé': { in: ['csv', 'xlsx'] },
    })
  })

  it('maps a comma-separated format string to an __in filter', () => {
    expect(buildFiltersFromQuery({ format: 'csv,xlsx' })).toEqual({
      'format normalisé': { in: ['csv', 'xlsx'] },
    })
  })

  it('ignores empty values', () => {
    expect(buildFiltersFromQuery({ format: '' })).toEqual({})
  })
})

describe('buildQueryFromFilters', () => {
  it('returns empty query when no filter is active', () => {
    expect(buildQueryFromFilters({})).toEqual({})
  })

  it('returns a single format for an in filter with one value', () => {
    expect(buildQueryFromFilters({ 'format normalisé': { in: ['csv'] } })).toEqual({
      format: 'csv',
    })
  })

  it('returns a comma-separated format list for an __in filter', () => {
    expect(buildQueryFromFilters({ 'format normalisé': { in: ['csv', 'xlsx'] } })).toEqual({
      format: 'csv,xlsx',
    })
  })
})
