import { describe, expect, it } from 'vitest'
import type { ChartForm, ColumnDefinition, DataSeriesForm } from '@datagouv/components-next'
import { toChartApi } from '~/datagouv-components/src/functions/charts'
import { applySerieCalculation, getSerieCalculation, getSerieColumnYOptions, keepValidSortCombined } from '~/utils/charts'

describe('keepValidSortCombined', () => {
  it('returns empty string when current sort is empty', () => {
    expect(keepValidSortCombined('', ['axis_x-asc', 'axis_x-desc'])).toBe('')
  })

  it('preserves a sort value that is still available', () => {
    expect(keepValidSortCombined('axis_x-asc', ['axis_x-asc', 'axis_x-desc'])).toBe('axis_x-asc')
  })

  it('resets to empty string when the sort value is no longer available', () => {
    expect(keepValidSortCombined('axis_y-asc', ['axis_x-asc', 'axis_x-desc'])).toBe('')
  })
})

const COLUMNS: Array<ColumnDefinition> = [
  { name: 'region', type: 'text' },
  { name: 'logements', type: 'number' },
  { name: 'taux', type: 'number' },
]

function serie(overrides: Partial<DataSeriesForm> = {}): DataSeriesForm {
  return { type: 'histogram', column_y: 'region', aggregate_y: 'count', resource_id: 'r1', filters: null, column_x_name_override: null, ...overrides }
}

function form(series: DataSeriesForm): ChartForm {
  return {
    title: '',
    description: '',
    private: false,
    owned: { organization: 'org', owner: null },
    x_axis: { column_x: 'region', type: 'discrete', limit: null, sort_combined: '' },
    y_axis: { label: '', min: null, max: null, unit: '', unit_position: 'suffix' },
    series: [series],
    filter: null,
    chart_type: 'histogram',
    extras: {},
  } as unknown as ChartForm
}

function sentSerie(s: DataSeriesForm) {
  const { aggregate_y, column_y } = toChartApi(form(s)).series[0]!
  return { aggregate_y, column_y }
}

describe('getSerieCalculation', () => {
  it.each([
    ['count', 'count'],
    ['sum', 'sum'],
    ['avg', 'avg'],
    ['min', 'min'],
    ['max', 'max'],
    [null, 'none'],
    ['', 'none'],
  ] as const)('reads aggregate_y %s as %s', (aggregate, calculation) => {
    expect(getSerieCalculation(serie({ aggregate_y: aggregate }))).toBe(calculation)
  })
})

describe('applySerieCalculation sends the same series as the former column + aggregation picker', () => {
  it('count counts the X column', () => {
    const s = serie({ column_y: 'logements', aggregate_y: 'sum' })
    applySerieCalculation(s, 'count', 'region', COLUMNS)
    expect(sentSerie(s)).toEqual({ aggregate_y: 'count', column_y: 'region' })
  })

  it.each(['sum', 'avg', 'min', 'max'] as const)('%s keeps a numeric Y column', (calculation) => {
    const s = serie({ column_y: 'taux', aggregate_y: null })
    applySerieCalculation(s, calculation, 'region', COLUMNS)
    expect(sentSerie(s)).toEqual({ aggregate_y: calculation, column_y: 'taux' })
  })

  it.each(['sum', 'avg', 'min', 'max'] as const)('%s after count picks the first numeric column', (calculation) => {
    const s = serie()
    applySerieCalculation(s, calculation, 'region', COLUMNS)
    expect(sentSerie(s)).toEqual({ aggregate_y: calculation, column_y: 'logements' })
  })

  it('none sends raw values of the current Y column', () => {
    const s = serie({ column_y: 'taux', aggregate_y: 'avg' })
    applySerieCalculation(s, 'none', 'region', COLUMNS)
    expect(sentSerie(s)).toEqual({ aggregate_y: null, column_y: 'taux' })
  })

  it('none after count keeps the X column as Y column', () => {
    const s = serie()
    applySerieCalculation(s, 'none', 'region', COLUMNS)
    expect(sentSerie(s)).toEqual({ aggregate_y: null, column_y: 'region' })
  })
})

describe('getSerieColumnYOptions', () => {
  it.each(['sum', 'avg', 'min', 'max'] as const)('offers only numeric columns for %s', (calculation) => {
    expect(getSerieColumnYOptions(calculation, COLUMNS).map(c => c.name)).toEqual(['logements', 'taux'])
  })

  it('offers every column for raw values', () => {
    expect(getSerieColumnYOptions('none', COLUMNS).map(c => c.name)).toEqual(['region', 'logements', 'taux'])
  })

  it('offers no column for count', () => {
    expect(getSerieColumnYOptions('count', COLUMNS)).toEqual([])
  })
})
