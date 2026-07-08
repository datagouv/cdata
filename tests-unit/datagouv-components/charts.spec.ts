import { describe, expect, it } from 'vitest'
import { buildColumnsFromProfile, toChartApi, toChartForm } from '~/datagouv-components/src/functions/charts'
import type { Chart } from '~/datagouv-components/src/types/visualizations'
import type { TabularProfile } from '~/datagouv-components/src/components/TabularExplorer/types'

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

describe('buildColumnsFromProfile', () => {
  const profile: { profile: TabularProfile } = {
    profile: {
      header: ['year', 'rate', 'label', 'created_at'],
      columns: {
        year: { score: 1, format: 'int', python_type: 'int' },
        rate: { score: 1, format: 'float', python_type: 'float' },
        label: { score: 1, format: 'string', python_type: 'string' },
        created_at: { score: 1, format: 'date', python_type: 'date' },
      },
      formats: {},
      profile: {
        year: { tops: [], nb_distinct: 6, nb_missing_values: 0, min: '2018', max: '2023' },
        rate: { tops: [], nb_distinct: 10, nb_missing_values: 0, min: 0, max: 49.5 },
        label: { tops: [], nb_distinct: 3, nb_missing_values: 0 },
        created_at: { tops: [], nb_distinct: 5, nb_missing_values: 0, min: '2018-01-01T00:00:00.000Z', max: '2023-12-31T23:59:59.000Z' },
      },
      encoding: 'utf-8',
      separator: ',',
      categorical: ['label'],
      total_lines: 100,
      nb_duplicates: 0,
      columns_fields: {},
      columns_labels: {},
      header_row_idx: 0,
      heading_columns: 0,
      trailing_columns: 0,
    },
  }

  it('includes normalized min/max from the profile', () => {
    const columns = buildColumnsFromProfile(profile)
    expect(columns).toEqual([
      { name: 'year', type: 'number', min: 2018, max: 2023 },
      { name: 'rate', type: 'number', min: 0, max: 49.5 },
      { name: 'label', type: 'categorical' },
      { name: 'created_at', type: 'date', min: new Date('2018-01-01T00:00:00.000Z').getTime(), max: new Date('2023-12-31T23:59:59.000Z').getTime() },
    ])
  })

  it('drops non-numeric min/max values', () => {
    const invalidProfile: { profile: TabularProfile } = {
      profile: {
        ...profile.profile,
        profile: {
          ...profile.profile.profile,
          year: { tops: [], nb_distinct: 6, nb_missing_values: 0, min: 'not-a-number', max: '2023' },
        },
      },
    }
    const columns = buildColumnsFromProfile(invalidProfile)
    const yearColumn = columns.find(c => c.name === 'year')
    expect(yearColumn).toEqual({ name: 'year', type: 'number', min: undefined, max: 2023 })
  })

  it('returns undefined min/max for date columns when the profile does not provide them', () => {
    const profileWithoutDateBounds: { profile: TabularProfile } = {
      profile: {
        ...profile.profile,
        profile: {
          ...profile.profile.profile,
          created_at: { tops: [], nb_distinct: 5, nb_missing_values: 0 },
        },
      },
    }
    const columns = buildColumnsFromProfile(profileWithoutDateBounds)
    const createdAtColumn = columns.find(c => c.name === 'created_at')
    expect(createdAtColumn).toEqual({ name: 'created_at', type: 'date', min: undefined, max: undefined })
  })
})
