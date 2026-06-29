import { describe, expect, it } from 'vitest'
import { toChartApi, toChartForm } from '~/datagouv-components/src/functions/charts'
import type { Chart } from '~/datagouv-components/src/types/visualizations'

const baseChart = {
  title: 'Mon graphique',
  description: 'desc',
  private: false,
  organization: { id: 'org-1' },
  owner: null,
  x_axis: { column_x: 'annee', type: 'categorical', sort_x_by: 'axis_x', sort_x_direction: 'asc' },
  y_axis: { label: 'Total', min: 0, max: 100, unit: '€', unit_position: 'suffix' },
  series: [{ type: 'bar', column_y: 'montant', aggregate_y: 'sum', filters: null }],
  extras: {},
} as unknown as Chart

describe('toChartForm / toChartApi', () => {
  it('encodes the sort as a combined string and decodes it back', () => {
    const form = toChartForm(baseChart)
    expect(form.x_axis.sort_combined).toEqual('axis_x-asc')

    const api = toChartApi(form)
    expect(api.x_axis.sort_x_by).toEqual('axis_x')
    expect(api.x_axis.sort_x_direction).toEqual('asc')
  })

  it('round-trips the absence of sort as null', () => {
    const chart = { ...baseChart, x_axis: { ...baseChart.x_axis, sort_x_by: null, sort_x_direction: null } } as Chart
    const form = toChartForm(chart)
    expect(form.x_axis.sort_combined).toEqual('')

    const api = toChartApi(form)
    expect(api.x_axis.sort_x_by).toBeNull()
    expect(api.x_axis.sort_x_direction).toBeNull()
  })

  it('maps ownership both ways', () => {
    expect(toChartForm(baseChart).owned).toEqual({ organization: 'org-1', owner: null })
    expect(toChartApi(toChartForm(baseChart))).toMatchObject({ organization: 'org-1', owner: null })

    const ownedChart = { ...baseChart, organization: null, owner: { id: 'user-1' } } as unknown as Chart
    expect(toChartForm(ownedChart).owned).toEqual({ owner: 'user-1', organization: null })
  })

  it('applies the selected chart type to the first serie', () => {
    const form = { ...toChartForm(baseChart), chart_type: 'line' as const }
    expect(toChartApi(form).series[0].type).toEqual('line')
  })

  it('applies the form filter to the first serie when it has none', () => {
    const filter = { column: 'region', value: 'Bretagne' }
    const form = { ...toChartForm(baseChart), filter } as ReturnType<typeof toChartForm>
    expect(toChartApi(form).series[0].filters).toEqual(filter)
  })
})
