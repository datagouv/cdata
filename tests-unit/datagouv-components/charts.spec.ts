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
  query: 'SELECT region, COUNT(*) AS total FROM data GROUP BY region',
  resource_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  y_axis: { label: 'Total', min: 0, max: 100, unit: '€', unit_position: 'suffix' },
  extras: {},
} as unknown as Chart

describe('toChartForm / toChartApi', () => {
  it('round-trips query, resource_id and y_axis', () => {
    const form = toChartForm(baseChart)
    expect(form.query).toEqual('SELECT region, COUNT(*) AS total FROM data GROUP BY region')
    expect(form.resource_id).toEqual('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    expect(form.y_axis).toEqual({ label: 'Total', min: 0, max: 100, unit: '€', unit_position: 'suffix' })

    const api = toChartApi(form)
    expect(api.query).toEqual('SELECT region, COUNT(*) AS total FROM data GROUP BY region')
    expect(api.resource_id).toEqual('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    expect(api.y_axis).toEqual({ label: 'Total', min: 0, max: 100, unit: '€', unit_position: 'suffix' })
  })

  it('sends query and resource_id as-is in the API payload', () => {
    const chart = {
      ...baseChart,
      query: 'SELECT annee, AVG(taux) FROM data GROUP BY annee LIMIT 500',
      resource_id: '9b2e5f4a-3c1d-4e6f-8a7b-1c2d3e4f5a6b',
    } as unknown as Chart

    const api = toChartApi(toChartForm(chart))
    expect(api.query).toEqual('SELECT annee, AVG(taux) FROM data GROUP BY annee LIMIT 500')
    expect(api.resource_id).toEqual('9b2e5f4a-3c1d-4e6f-8a7b-1c2d3e4f5a6b')
  })

  it('maps ownership both ways', () => {
    expect(toChartForm(baseChart).owned).toEqual({ organization: 'org-1', owner: null })
    expect(toChartApi(toChartForm(baseChart))).toMatchObject({ organization: 'org-1', owner: null })

    const ownedChart = { ...baseChart, organization: null, owner: { id: 'user-1' } } as unknown as Chart
    expect(toChartForm(ownedChart).owned).toEqual({ owner: 'user-1', organization: null })
    expect(toChartApi(toChartForm(ownedChart))).toMatchObject({ owner: 'user-1', organization: null })
  })

  it('normalizes empty y_axis fields in the form and back to nullables in the API payload', () => {
    const chart = {
      ...baseChart,
      y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
    } as unknown as Chart

    const form = toChartForm(chart)
    expect(form.y_axis).toEqual({ label: '', min: null, max: null, unit: '', unit_position: 'suffix' })

    const api = toChartApi(form)
    expect(api.y_axis).toEqual({ label: null, min: null, max: null, unit: null, unit_position: 'suffix' })
  })

  it('keeps empty strings as null in the API payload', () => {
    const form = toChartForm(baseChart)
    form.y_axis.label = ''
    form.y_axis.unit = ''

    const api = toChartApi(form)
    expect(api.y_axis.label).toBeNull()
    expect(api.y_axis.unit).toBeNull()
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
    expect(columns.find(c => c.name === 'year')).toEqual({ name: 'year', type: 'number', min: 2018, max: 2023 })
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
