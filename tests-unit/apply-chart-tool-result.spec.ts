import { describe, expect, it } from 'vitest'
import { toChartApi } from '~/datagouv-components/src/functions/charts'
import type { ChartForm, GenericFilter } from '@datagouv/components-next'
import { applyChartToolResult, createChartResultHandler } from '~/components/Charts/applyChartToolResult'
import type { ChartToolChart, ChartToolResult } from '~/utils/assistant'

const filter = { _cls: 'Filter', column: 'region', condition: 'exact', value: 'Bretagne' } as unknown as GenericFilter

function makeForm(): ChartForm {
  return {
    title: 'Old',
    description: 'Old description',
    private: true,
    owned: { owner: 'user-1', organization: null },
    x_axis: { column_x: 'a', type: 'discrete', limit: null, sort_combined: '' },
    y_axis: { label: 'old label', min: 1, max: 9, unit: 'kg', unit_position: 'prefix' },
    series: [{ type: 'line', column_y: 'old', aggregate_y: '', resource_id: 'old-res', filters: null, column_x_name_override: null }],
    extras: { keep: 'me' },
    chart_type: 'line',
    filter: null,
  } as unknown as ChartForm
}

function makeChart(overrides: Partial<ChartToolChart> = {}): ChartToolChart {
  return {
    title: 'New',
    description: 'New description',
    x_axis: { column_x: 'year', type: 'date', sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: 10 },
    y_axis: { label: null, unit: '€', unit_position: 'suffix', min: 0, max: null },
    series: [{ type: 'histogram', column_y: 'amount', aggregate_y: null, resource_id: 'res-1', column_x_name_override: null, filters: filter }],
    ...overrides,
  } as ChartToolChart
}

const create = (chart = makeChart()): ChartToolResult => ({ toolCallId: 't', kind: 'create', chart, moreGroups: false })
const update = (patch: Extract<ChartToolResult, { kind: 'update' }>['patch']): ChartToolResult => ({ toolCallId: 't', kind: 'update', patch })

describe('applyChartToolResult', () => {
  it('replaces the structure on create', () => {
    const form = makeForm()
    applyChartToolResult(form, create())
    expect(form.title).toBe('New')
    expect(form.description).toBe('New description')
    expect(form.chart_type).toBe('histogram')
    expect(form.filter).toEqual(filter)
    expect(form.x_axis).toEqual({ column_x: 'year', type: 'date', limit: 10, sort_combined: 'axis_x-asc' })
    expect(form.series).toEqual([{ type: 'histogram', column_y: 'amount', aggregate_y: '', resource_id: 'res-1', filters: null, column_x_name_override: null }])
    expect(form.y_axis).toEqual({ label: '', unit: '€', unit_position: 'suffix', min: 0, max: null })
  })

  it('maps the sort to sort_combined', () => {
    const form = makeForm()
    const chart = makeChart()
    chart.x_axis.sort_x_by = 'axis_y'
    chart.x_axis.sort_x_direction = 'desc'
    applyChartToolResult(form, create(chart))
    expect(form.x_axis.sort_combined).toBe('axis_y-desc')
    const none = makeChart()
    none.x_axis.sort_x_by = null as never
    none.x_axis.sort_x_direction = null as never
    applyChartToolResult(form, create(none))
    expect(form.x_axis.sort_combined).toBe('')
  })

  it('patches only the given fields on update', () => {
    const form = makeForm()
    applyChartToolResult(form, update({ title: 'Patched', type: 'histogram', y_axis: { unit: '%', max: null } }))
    expect(form.title).toBe('Patched')
    expect(form.description).toBe('Old description')
    expect(form.chart_type).toBe('histogram')
    expect(form.y_axis).toEqual({ label: 'old label', min: 1, max: null, unit: '%', unit_position: 'prefix' })
    expect(form.x_axis.column_x).toBe('a')
    applyChartToolResult(form, update({ y_axis: { label: null, unit: null } }))
    expect(form.y_axis.label).toBe('')
    expect(form.y_axis.unit).toBe('')
  })

  it('points count series at the x column', () => {
    const form = makeForm()
    const chart = makeChart()
    chart.x_axis.column_x = 'reg'
    chart.series = [{ ...chart.series[0]!, column_y: 'dep', aggregate_y: 'count' }]
    applyChartToolResult(form, create(chart))
    expect(form.series[0]!.column_y).toBe('reg')
    expect(form.series[0]!.aggregate_y).toBe('count')
  })

  it('keeps the owner and privacy', () => {
    const form = makeForm()
    applyChartToolResult(form, create())
    expect(form.owned).toEqual({ owner: 'user-1', organization: null })
    expect(form.private).toBe(true)
    expect(form.extras).toEqual({ keep: 'me' })
  })

  it('does not share the filter object with the result', () => {
    const form = makeForm()
    const result = create()
    applyChartToolResult(form, result)
    expect(form.filter).not.toBe(filter)
    expect(form.filter).toEqual(filter)
  })

  it('round-trips through toChartApi', () => {
    const form = makeForm()
    const chart = makeChart()
    chart.series.push({ ...chart.series[0]!, column_y: 'other', filters: null })
    applyChartToolResult(form, create(chart))
    const api = toChartApi(form)
    expect(api.x_axis.limit).toBe(10)
    expect(api.series).toHaveLength(2)
    for (const serie of api.series) {
      expect(serie.type).toBe('histogram')
      expect(serie.filters).toEqual(filter)
    }
  })
})

describe('createChartResultHandler', () => {
  it('applies a tool call once: a re-emitted result never overwrites later manual edits', () => {
    const form = makeForm()
    const handle = createChartResultHandler(() => form, () => 'res-1')
    handle(create())
    expect(form.title).toBe('New')

    form.title = 'Edited by hand'
    handle(create())
    expect(form.title).toBe('Edited by hand')
  })

  it('ignores a created chart for another resource than the selected one', () => {
    const form = makeForm()
    const handle = createChartResultHandler(() => form, () => 'other-res')
    handle(create())
    expect(form.title).toBe('Old')
  })
})
