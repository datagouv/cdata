import { describe, expect, it } from 'vitest'
import { buildFiltersFromQuery, computeFamilyStats, formatDelta, formatMonth, getDeltaDirection, getPreviousMonth, roundDelta } from '~/utils/previewDashboard'
import type { PreviewDashboardFormatStat } from '~/types/preview-dashboard'

function makeStat(overrides: Partial<PreviewDashboardFormatStat> = {}): PreviewDashboardFormatStat {
  return {
    'Famille de format': 'Tabulaire',
    'Format': 'csv',
    'Nombre': 10,
    'Prévisualisable': 5,
    '% catalogue': 2.5,
    '% erreur': 0.5,
    '% too big': 0.2,
    '% prévisualisable': 50,
    '% prévisualisation manquante': 0.3,
    'Mois': '2026-07',
    '__id': 1,
    ...overrides,
  }
}

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

  it('trims and drops blank segments', () => {
    expect(buildFiltersFromQuery({ format: ' csv , , xlsx ' })).toEqual({
      'format normalisé': { in: ['csv', 'xlsx'] },
    })
  })

  it('drops the null entries a valueless query param produces', () => {
    expect(buildFiltersFromQuery({ format: [null, 'csv'] })).toEqual({
      'format normalisé': { in: ['csv'] },
    })
  })
})

describe('formatMonth', () => {
  it('pads single-digit months', () => {
    expect(formatMonth(new Date(2026, 0, 15))).toBe('2026-01')
  })

  it('formats double-digit months', () => {
    expect(formatMonth(new Date(2026, 11, 1))).toBe('2026-12')
  })
})

describe('getPreviousMonth', () => {
  it('returns the previous month', () => {
    expect(getPreviousMonth('2026-07')).toBe('2026-06')
  })

  it('crosses the year boundary', () => {
    expect(getPreviousMonth('2026-01')).toBe('2025-12')
  })
})

describe('formatDelta', () => {
  it('prefixes positive count deltas with a plus', () => {
    expect(formatDelta(3, 'count')).toBe('+3')
  })

  it('keeps the minus sign on negative count deltas', () => {
    expect(formatDelta(-3, 'count')).toBe('-3')
  })

  it('renders a zero count delta without a sign', () => {
    expect(formatDelta(0, 'count')).toBe('0')
  })

  it('rounds count deltas', () => {
    expect(formatDelta(3.6, 'count')).toBe('+4')
  })

  it('formats positive point deltas as percentages', () => {
    expect(formatDelta(2.54, 'points')).toBe('+2.5%')
  })

  it('keeps the minus sign on negative point deltas', () => {
    expect(formatDelta(-2.5, 'points')).toBe('-2.5%')
  })

  it('renders a zero point delta without a sign', () => {
    expect(formatDelta(0, 'points')).toBe('0.0%')
  })

  it('drops the sign when a point delta rounds to zero', () => {
    expect(formatDelta(0.03, 'points')).toBe('0.0%')
    expect(formatDelta(-0.03, 'points')).toBe('0.0%')
  })

  it('drops the sign when a count delta rounds to zero', () => {
    expect(formatDelta(-0.4, 'count')).toBe('0')
  })
})

describe('roundDelta', () => {
  it('reports no direction for a point delta that rounds to zero', () => {
    expect(getDeltaDirection(roundDelta(-0.03, 'points'))).toBe('neutral')
    expect(getDeltaDirection(roundDelta(0.03, 'points'))).toBe('neutral')
  })

  it('keeps the direction of a delta that survives rounding', () => {
    expect(getDeltaDirection(roundDelta(-0.06, 'points'))).toBe('down')
    expect(getDeltaDirection(roundDelta(0.6, 'count'))).toBe('up')
  })
})

describe('getDeltaDirection', () => {
  it('returns up for positive values', () => {
    expect(getDeltaDirection(1)).toBe('up')
  })

  it('returns down for negative values', () => {
    expect(getDeltaDirection(-1)).toBe('down')
  })

  it('returns neutral for zero', () => {
    expect(getDeltaDirection(0)).toBe('neutral')
  })
})

describe('computeFamilyStats', () => {
  it('ignores rows from other months', () => {
    const rows = [
      makeStat({ Mois: '2026-07', __id: 1 }),
      makeStat({ Mois: '2026-06', __id: 2 }),
      makeStat({ Mois: '2026-05', __id: 3 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    expect(stats).toHaveLength(1)
    expect(stats[0].count).toBe(10)
  })

  it('weights percentage columns by Nombre', () => {
    const rows = [
      makeStat({ 'Format': 'csv', 'Nombre': 10, '% erreur': 10, '% too big': 5, '% prévisualisation manquante': 2, '__id': 1 }),
      makeStat({ 'Format': 'xlsx', 'Nombre': 30, '% erreur': 20, '% too big': 15, '% prévisualisation manquante': 6, '__id': 2 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    expect(stats[0].percentageError).toBeCloseTo(17.5)
    expect(stats[0].percentageTooBig).toBeCloseTo(12.5)
    expect(stats[0].percentageMissingPreview).toBeCloseTo(5)
  })

  it('computes percentageOfCatalog against the current month total', () => {
    const rows = [
      makeStat({ 'Famille de format': 'Tabulaire', 'Nombre': 10, '__id': 1 }),
      makeStat({ 'Famille de format': 'Document', 'Format': 'pdf', 'Nombre': 30, '__id': 2 }),
      makeStat({ 'Famille de format': 'Tabulaire', 'Mois': '2026-06', 'Nombre': 100, '__id': 3 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    const tabulaire = stats.find(s => s.family === 'Tabulaire')!
    expect(tabulaire.percentageOfCatalog).toBeCloseTo(25)
  })

  it('computes positive, negative and zero deltas against the previous month', () => {
    const rows = [
      makeStat({ 'Famille de format': 'Tabulaire', 'Format': 'csv', 'Mois': '2026-07', 'Nombre': 13, 'Prévisualisable': 13, '__id': 1 }),
      makeStat({ 'Famille de format': 'Tabulaire', 'Format': 'csv', 'Mois': '2026-06', 'Nombre': 10, 'Prévisualisable': 5, '__id': 2 }),
      makeStat({ 'Famille de format': 'Document', 'Format': 'pdf', 'Mois': '2026-07', 'Nombre': 8, 'Prévisualisable': 4, '__id': 3 }),
      makeStat({ 'Famille de format': 'Document', 'Format': 'pdf', 'Mois': '2026-06', 'Nombre': 10, 'Prévisualisable': 5, '__id': 4 }),
      makeStat({ 'Famille de format': 'Image', 'Format': 'png', 'Mois': '2026-07', 'Nombre': 10, 'Prévisualisable': 5, '__id': 5 }),
      makeStat({ 'Famille de format': 'Image', 'Format': 'png', 'Mois': '2026-06', 'Nombre': 10, 'Prévisualisable': 5, '__id': 6 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    const tabulaire = stats.find(s => s.family === 'Tabulaire')!
    const document = stats.find(s => s.family === 'Document')!
    const image = stats.find(s => s.family === 'Image')!

    expect(tabulaire.countDelta).toBe(3)
    expect(tabulaire.previewDelta).toBeCloseTo(50)
    expect(document.countDelta).toBe(-2)
    expect(document.previewDelta).toBeCloseTo(0)
    expect(image.countDelta).toBe(0)
    expect(image.previewDelta).toBeCloseTo(0)
  })

  it('sums every format of a family before comparing it to the previous month', () => {
    const rows = [
      makeStat({ Format: 'csv', Mois: '2026-07', Nombre: 30, Prévisualisable: 24, __id: 1 }),
      makeStat({ Format: 'xlsx', Mois: '2026-07', Nombre: 10, Prévisualisable: 6, __id: 2 }),
      makeStat({ Format: 'csv', Mois: '2026-06', Nombre: 20, Prévisualisable: 10, __id: 3 }),
      makeStat({ Format: 'xlsx', Mois: '2026-06', Nombre: 10, Prévisualisable: 5, __id: 4 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    // 40 - 30 resources, and 30/40 previewable against 15/30 the month before
    expect(stats[0].countDelta).toBe(10)
    expect(stats[0].previewDelta).toBeCloseTo(25)
  })

  it('leaves deltas undefined when there is no previous month data', () => {
    const rows = [makeStat({ Mois: '2026-07', __id: 1 })]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    expect(stats[0].countDelta).toBeUndefined()
    expect(stats[0].previewDelta).toBeUndefined()
    expect(stats[0].formats[0].countDelta).toBeUndefined()
    expect(stats[0].formats[0].previewDelta).toBeUndefined()
  })

  it('leaves previewDelta undefined when the current month count is zero', () => {
    const rows = [
      makeStat({ Mois: '2026-07', Nombre: 0, Prévisualisable: 0, __id: 1 }),
      makeStat({ Mois: '2026-06', Nombre: 10, Prévisualisable: 5, __id: 2 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    expect(stats[0].previewDelta).toBeUndefined()
  })

  it('sorts families by descending count', () => {
    const rows = [
      makeStat({ 'Famille de format': 'Tabulaire', 'Nombre': 10, '__id': 1 }),
      makeStat({ 'Famille de format': 'Document', 'Format': 'pdf', 'Nombre': 30, '__id': 2 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    expect(stats.map(s => s.family)).toEqual(['Document', 'Tabulaire'])
  })
})

// The summary tiles are derived from these totals in the page, so the invariants
// they rely on are asserted here.
describe('computeFamilyStats summary totals', () => {
  it('sums only the rows of the requested month', () => {
    const rows = [
      makeStat({ Mois: '2026-07', Nombre: 10, Prévisualisable: 5, __id: 1 }),
      makeStat({ Mois: '2026-06', Nombre: 7, Prévisualisable: 4, __id: 2 }),
    ]
    const stats = computeFamilyStats(rows, '2026-07', '2026-06')
    const total = stats.reduce((sum, family) => sum + family.count, 0)
    const previewableCount = stats.reduce((sum, family) => sum + family.withPreview, 0)
    expect(total).toBe(10)
    expect(previewableCount).toBe(5)
    expect((previewableCount / total) * 100).toBeCloseTo(50)
  })

  it('returns no family when there are no rows for the requested month', () => {
    const rows = [makeStat({ Mois: '2026-06', __id: 1 })]
    expect(computeFamilyStats(rows, '2026-07', '2026-06')).toEqual([])
  })

  it('returns no family for an empty dataset', () => {
    expect(computeFamilyStats([], '2026-07', '2026-06')).toEqual([])
  })
})
