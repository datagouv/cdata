import { describe, expect, it } from 'vitest'
import { CHART_PAGE_SIZE, chartDataKey, chartRequestSortDirection, groupsBeyondPage, truncationWarning } from '~/datagouv-components/src/functions/chartData'
import type { ChartForApi } from '~/datagouv-components/src/types/visualizations'

const chart = {
  title: 'T',
  description: '',
  private: false,
  extras: {},
  x_axis: { column_x: 'dep', type: 'discrete', sort_x_by: null, sort_x_direction: null },
  y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
  series: [{ type: 'line', column_y: 'n', aggregate_y: 'max', resource_id: 'r1', column_x_name_override: null, filters: null }],
} as unknown as ChartForApi

const t = (key: string, options?: Record<string, string | number> | number) =>
  key.replace(/\{(\w+)\}/g, (_, k) => String((options as Record<string, string>)[k]))

describe('chartDataKey', () => {
  it('ignores presentation fields', () => {
    const other = structuredClone(chart)
    other.title = 'Other'
    other.series[0]!.type = 'histogram'
    other.y_axis.unit = '%'
    other.x_axis.sort_x_by = 'axis_y'
    expect(chartDataKey(other)).toBe(chartDataKey(chart))
  })

  it('changes with data fields', () => {
    const other = structuredClone(chart)
    other.series[0]!.aggregate_y = 'sum'
    expect(chartDataKey(other)).not.toBe(chartDataKey(chart))
    const another = structuredClone(chart)
    another.x_axis.column_x = 'region'
    expect(chartDataKey(another)).not.toBe(chartDataKey(chart))
  })

  it('changes with the request sort direction only', () => {
    const yDesc = structuredClone(chart)
    yDesc.x_axis.sort_x_by = 'axis_y'
    yDesc.x_axis.sort_x_direction = 'desc'
    const yAsc = structuredClone(yDesc)
    yAsc.x_axis.sort_x_direction = 'asc'
    expect(chartDataKey(yAsc)).toBe(chartDataKey(yDesc))
    const xDesc = structuredClone(yDesc)
    xDesc.x_axis.sort_x_by = 'axis_x'
    expect(chartDataKey(xDesc)).not.toBe(chartDataKey(yDesc))
  })
})

describe('chartRequestSortDirection', () => {
  it('follows a descending X sort', () => {
    const other = structuredClone(chart)
    other.x_axis.sort_x_by = 'axis_x'
    other.x_axis.sort_x_direction = 'desc'
    expect(chartRequestSortDirection(other)).toBe('desc')
  })

  it('is ascending in every other case', () => {
    const cases: Array<[ChartForApi['x_axis']['sort_x_by'], ChartForApi['x_axis']['sort_x_direction']]> = [
      ['axis_x', 'asc'], ['axis_y', 'desc'], ['axis_y', 'asc'], [null, null],
    ]
    for (const [by, direction] of cases) {
      const other = structuredClone(chart)
      other.x_axis.sort_x_by = by
      other.x_axis.sort_x_direction = direction
      expect(chartRequestSortDirection(other)).toBe('asc')
    }
  })
})

describe('truncationWarning', () => {
  it('returns the Y-sort copy', () => {
    expect(truncationWarning('dep', 'axis_y', t)).toBe('Graphique tronqué : seules les 50 premières valeurs de dep sont prises en compte, le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.')
  })

  it('returns the X-sort copy otherwise', () => {
    expect(truncationWarning('dep', 'axis_x', t)).toBe('Graphique tronqué : seules les 50 premières valeurs de dep sont affichées. Ajoutez un filtre pour voir les autres valeurs.')
    expect(truncationWarning('dep', null, t)).toBe('Graphique tronqué : seules les 50 premières valeurs de dep sont affichées. Ajoutez un filtre pour voir les autres valeurs.')
  })
})

describe('groupsBeyondPage', () => {
  const full = CHART_PAGE_SIZE
  const next = 'https://tabular.example.com/api/resources/r/data/?page=2&page_size=50'

  it('knows a page that is not full holds every group', () => {
    expect(groupsBeyondPage({ rowCount: full - 1, aggregated: true, next })).toBe(false)
    expect(groupsBeyondPage({ rowCount: full - 1, aggregated: false, total: 926, next })).toBe(false)
  })

  it('reads the row count of a raw series from the total of its response', () => {
    expect(groupsBeyondPage({ rowCount: full, aggregated: false, total: full + 1, next })).toBe(true)
    expect(groupsBeyondPage({ rowCount: full, aggregated: false, total: full, next })).toBe(false)
  })

  // api-tabular sends no total for an aggregate; from the exact-next-link version on,
  // its next link is only there when a group is left
  it('knows a full aggregated page without a next link holds every group', () => {
    expect(groupsBeyondPage({ rowCount: full, aggregated: true, next: null })).toBe(false)
    expect(groupsBeyondPage({ rowCount: full, aggregated: true })).toBe(false)
  })

  it('probes a full aggregated page with a next link, which older versions send for any full page', () => {
    expect(groupsBeyondPage({ rowCount: full, aggregated: true, next })).toBe('probe')
  })
})
