import { describe, expect, it } from 'vitest'
import { buildColumnsFromProfile, formatYAxisValue, toChartApi, toChartForm } from '~/datagouv-components/src/functions/charts'
import type { Chart } from '~/datagouv-components/src/types/visualizations'
import type { TabularProfile } from '~/datagouv-components/src/components/TabularExplorer/types'

const baseChart = {
  title: 'Mon graphique',
  description: 'desc',
  private: false,
  organization: { id: 'org-1' },
  owner: null,
  x_axis: { column_x: 'annee', type: 'categorical', sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: null },
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

  it('round-trips grouped filters through the form', () => {
    const filters = {
      _cls: 'AndFilters',
      filters: [
        { _cls: 'Filter', column: 'region', condition: 'exact', value: 'Bretagne' },
        { _cls: 'OrFilters', filters: [
          { _cls: 'Filter', column: 'annee', condition: 'exact', value: '2020' },
          { _cls: 'Filter', column: 'annee', condition: 'exact', value: '2021' },
        ] },
      ],
    } as const
    const chart = {
      ...baseChart,
      series: [{ type: 'bar', column_y: 'montant', aggregate_y: 'sum', filters }],
    } as unknown as Chart

    const form = toChartForm(chart)
    expect(form.filter).toEqual(filters)

    const api = toChartApi(form)
    expect(api.series[0].filters).toEqual(filters)
  })

  it('round-trips a count aggregation', () => {
    const chart = {
      ...baseChart,
      x_axis: { ...baseChart.x_axis, column_x: 'region' },
      series: [{ type: 'bar', column_y: 'region', aggregate_y: 'count', filters: null }],
    } as unknown as Chart

    const form = toChartForm(chart)
    expect(form.series[0].aggregate_y).toEqual('count')
    expect(form.series[0].column_y).toEqual('region')

    const api = toChartApi(form)
    expect(api.series[0].aggregate_y).toEqual('count')
    expect(api.series[0].column_y).toEqual('region')
  })

  it('preserves an empty aggregate as null in the API payload', () => {
    const chart = {
      ...baseChart,
      series: [{ type: 'bar', column_y: 'montant', aggregate_y: null, filters: null }],
    } as unknown as Chart

    const form = toChartForm(chart)
    expect(form.series[0].aggregate_y).toEqual('')

    const api = toChartApi(form)
    expect(api.series[0].aggregate_y).toBeNull()
  })

  it('keeps x_axis.limit through the form round trip', () => {
    const chart = { ...baseChart, x_axis: { ...baseChart.x_axis, limit: 12 } } as unknown as Chart
    const form = toChartForm(chart)
    expect(form.x_axis.limit).toEqual(12)
    expect(toChartApi(form).x_axis.limit).toEqual(12)
  })

  it('sends a null limit when the chart has none', () => {
    const chart = { ...baseChart, x_axis: { column_x: 'annee', type: 'discrete', sort_x_by: null, sort_x_direction: null } } as unknown as Chart
    const form = toChartForm(chart)
    expect(form.x_axis.limit).toBeNull()
    expect(toChartApi(form).x_axis.limit).toBeNull()
  })

  it('sends no filter once the filter of a filtered chart is removed in the form', () => {
    const filter = { _cls: 'Filter', column: 'region', condition: 'exact', value: 'Bretagne' } as const
    const chart = {
      ...baseChart,
      series: [{ type: 'bar', column_y: 'montant', aggregate_y: 'sum', filters: filter }],
    } as unknown as Chart
    const form = toChartForm(chart)
    form.filter = null
    expect(toChartApi(form).series[0].filters).toBeNull()
  })

  it('sends the edited form filter instead of the filter the chart was loaded with', () => {
    const chart = {
      ...baseChart,
      series: [{ type: 'bar', column_y: 'montant', aggregate_y: 'sum', filters: { _cls: 'Filter', column: 'region', condition: 'exact', value: 'Bretagne' } }],
    } as unknown as Chart
    const form = toChartForm(chart)
    const edited = { _cls: 'Filter', column: 'region', condition: 'exact', value: 'Normandie' } as const
    form.filter = edited
    expect(toChartApi(form).series[0].filters).toEqual(edited)
  })

  it('applies the chart type and the form filter to every series', () => {
    const own = { _cls: 'Filter', column: 'a', condition: 'exact', value: '1' } as const
    const shared = { _cls: 'Filter', column: 'b', condition: 'exact', value: '2' } as const
    const chart = {
      ...baseChart,
      series: [
        { type: 'bar', column_y: 'm', aggregate_y: 'sum', filters: shared },
        { type: 'bar', column_y: 'n', aggregate_y: 'sum', filters: null },
        { type: 'bar', column_y: 'o', aggregate_y: 'sum', filters: own },
      ],
    } as unknown as Chart
    const form = toChartForm(chart)
    form.chart_type = 'line'
    const api = toChartApi(form)
    expect(api.series.map(s => s.type)).toEqual(['line', 'line', 'line'])
    expect(api.series[0].filters).toEqual(shared)
    expect(api.series[1].filters).toEqual(shared)
    expect(api.series[2].filters).toEqual(shared)
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

  // A group-by yields one group per distinct value, plus one for the empty cells.
  // The profile leaves nb_distinct at 0 for the columns it does not count (free text).
  it('counts the groups a group-by on the column yields, when the profile counts them', () => {
    const counted: { profile: TabularProfile } = {
      profile: {
        ...profile.profile,
        profile: {
          ...profile.profile.profile,
          year: { tops: [], nb_distinct: 6, nb_missing_values: 4 },
          label: { tops: [], nb_distinct: 0, nb_missing_values: 0 },
        },
      },
    }
    const columns = buildColumnsFromProfile(counted)
    expect(columns.find(c => c.name === 'year')?.distinctValues).toBe(7)
    expect(columns.find(c => c.name === 'rate')?.distinctValues).toBe(10)
    expect(columns.find(c => c.name === 'label')?.distinctValues).toBeUndefined()
  })

  it('includes normalized min/max from the profile', () => {
    const columns = buildColumnsFromProfile(profile)
    expect(columns).toEqual([
      { name: 'year', type: 'number', min: 2018, max: 2023, distinctValues: 6 },
      { name: 'rate', type: 'number', min: 0, max: 49.5, distinctValues: 10 },
      { name: 'label', type: 'categorical', distinctValues: 3 },
      { name: 'created_at', type: 'date', min: new Date('2018-01-01T00:00:00.000Z').getTime(), max: new Date('2023-12-31T23:59:59.000Z').getTime(), distinctValues: 5 },
    ])
  })

  it('keeps a year column as a number, the only numeric type the chart stack knows', () => {
    const yearFormatProfile: { profile: TabularProfile } = {
      profile: {
        ...profile.profile,
        columns: {
          ...profile.profile.columns,
          year: { score: 1, format: 'year', python_type: 'int' },
        },
      },
    }
    const columns = buildColumnsFromProfile(yearFormatProfile)
    expect(columns.find(c => c.name === 'year')).toEqual({ name: 'year', type: 'number', min: 2018, max: 2023, distinctValues: 6 })
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
    expect(yearColumn).toEqual({ name: 'year', type: 'number', min: undefined, max: 2023, distinctValues: 6 })
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
    expect(createdAtColumn).toEqual({ name: 'created_at', type: 'date', min: undefined, max: undefined, distinctValues: 5 })
  })

  // Non-CSV resources (parquet…) are indexed without csv-detective: the profile
  // only carries the column names, their types and the row count.
  it('builds columns from a profile without csv-detective output', () => {
    const parquetProfile: { profile: TabularProfile } = {
      profile: {
        header: profile.profile.header,
        columns: profile.profile.columns,
        total_lines: profile.profile.total_lines,
      },
    }
    const columns = buildColumnsFromProfile(parquetProfile)
    expect(columns).toEqual([
      { name: 'year', type: 'number', min: undefined, max: undefined },
      { name: 'rate', type: 'number', min: undefined, max: undefined },
      { name: 'label', type: 'text', min: undefined, max: undefined },
      { name: 'created_at', type: 'date', min: undefined, max: undefined },
    ])
  })
})

describe('formatYAxisValue', () => {
  // Intl puts a no-break space between the number and the compact suffix.
  const NBSP = '\u00A0'

  it('gives distinct fractional ticks distinct labels with a decimal comma', () => {
    const labels = [0, 0.2, 0.4, 0.6, 0.8, 1].map(v => formatYAxisValue(v, 'fr', { unit: null, unit_position: null }))

    expect(labels).toEqual(['0', '0,2', '0,4', '0,6', '0,8', '1'])
  })

  it('abbreviates thousands and millions the French way', () => {
    const format = (v: number) => formatYAxisValue(v, 'fr', { unit: null, unit_position: null })

    expect(format(12000)).toBe(`12${NBSP}k`)
    expect(format(1250000)).toBe(`1,25${NBSP}M`)
    expect(format(-3500000)).toBe(`-3,5${NBSP}M`)
  })

  it('keeps distinct close ticks distinct once abbreviated', () => {
    const labels = [1200000, 1220000, 1240000].map(v => formatYAxisValue(v, 'fr', { unit: null, unit_position: null }))

    expect(new Set(labels).size).toBe(3)
  })

  it('does not abbreviate values below a thousand', () => {
    expect(formatYAxisValue(999, 'fr', { unit: null, unit_position: null })).toBe('999')
  })

  it('puts the unit after the value by default', () => {
    expect(formatYAxisValue(2.5, 'fr', { unit: 'kg', unit_position: null })).toBe('2,5 kg')
  })

  it('puts a prefix unit before the value', () => {
    expect(formatYAxisValue(1500, 'fr', { unit: '€', unit_position: 'prefix' })).toBe(`€ 1,5${NBSP}k`)
  })
})
