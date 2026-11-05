import { describe, expect, it } from 'vitest'
import { chartDataKey, chartRequestSortDirection, truncationWarning } from '~/datagouv-components/src/functions/chartData'
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
    expect(truncationWarning('dep', 'axis_y', t)).toBe('Seules les 50 premières valeurs de dep sont prises en compte : le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.')
  })

  it('returns the X-sort copy otherwise', () => {
    expect(truncationWarning('dep', 'axis_x', t)).toBe('Seules les 50 premières valeurs de dep sont affichées.')
    expect(truncationWarning('dep', null, t)).toBe('Seules les 50 premières valeurs de dep sont affichées.')
  })
})
