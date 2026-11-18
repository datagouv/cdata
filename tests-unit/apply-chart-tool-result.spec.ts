import { describe, expect, it } from 'vitest'
import type { ChartContent, ChartForm, GenericFilter } from '@datagouv/components-next'
import { applyChartToolResult, createChartResultHandler } from '~/components/Charts/applyChartToolResult'
import type { ChartToolResult } from '~/utils/assistant'

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

function makeChart(overrides: Partial<ChartContent> = {}): ChartContent {
  return {
    title: 'New',
    description: 'New description',
    x_axis: { column_x: 'year', type: 'date', sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: 10 },
    y_axis: { label: null, unit: '€', unit_position: 'suffix', min: 0, max: null },
    series: [{ type: 'histogram', column_y: 'amount', aggregate_y: null, resource_id: 'res-1', column_x_name_override: null, filters: filter }],
    ...overrides,
  } as ChartContent
}

const create = (chart = makeChart()): ChartToolResult => ({ toolCallId: 't', kind: 'create', chart })
const update = (patch: Extract<ChartToolResult, { kind: 'update' }>['patch']): ChartToolResult => ({ toolCallId: 't', kind: 'update', patch })

describe('applyChartToolResult', () => {
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

  // The conversion itself is tested with chartContentToForm (charts.spec.ts).
  it('replaces the content on create, but not the owner, privacy and extras', () => {
    const form = makeForm()
    applyChartToolResult(form, create())
    expect(form.title).toBe('New')
    expect(form.series[0]!.resource_id).toBe('res-1')
    expect(form.owned).toEqual({ owner: 'user-1', organization: null })
    expect(form.private).toBe(true)
    expect(form.extras).toEqual({ keep: 'me' })
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
