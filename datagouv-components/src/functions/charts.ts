import type { Chart, ChartForm, ChartForApi, ColumnDefinition } from '../types/visualizations'
import type { ColumnType, TabularProfile } from '../components/TabularExplorer/types'
import type { SqlQueryResult } from './tabularApi'
import { resolveColumnType } from './tabular'

export type InferredChartConfig = {
  xColumn: string
  seriesColumns: Array<string>
}

// Above this length an X value is a text (sentence/paragraph), not a category label.

/**
 * Infer a render config from a SQL query result: first column is the X axis,
 * following numeric columns are series. The chart is a bar chart when every X
 * value is a short non-date string, a line chart otherwise.
 */
export function inferChartConfig(result: SqlQueryResult): InferredChartConfig {
  const xColumn = result.columns[0] ?? ''
  const seriesColumns = result.columns.filter((column, index) => {
    return index > 0 && isNumericColumn(result.rows, index)
  })
  return { xColumn, seriesColumns }
}

function isNumericColumn(rows: SqlQueryResult['rows'], index: number): boolean {
  let sawValue = false
  for (const row of rows) {
    const value = row[index]
    if (value === null || value === undefined) continue
    if (typeof value !== 'number' || Number.isNaN(value)) return false
    sawValue = true
  }
  return sawValue
}

export function toChartForm(chart: Chart): ChartForm {
  return {
    title: chart.title,
    description: chart.description,
    private: chart.private,
    owned: chart.organization ? { organization: chart.organization.id, owner: null } : { owner: chart.owner.id, organization: null },
    query: chart.query,
    resource_id: chart.resource_id,
    chart_type: chart.chart_type ?? 'line',
    y_axis: {
      label: chart.y_axis.label || '',
      min: chart.y_axis.min,
      max: chart.y_axis.max,
      unit: chart.y_axis.unit || '',
      unit_position: chart.y_axis.unit_position || 'suffix',
    },
    extras: chart.extras,
  }
}

export function toChartApi(chartForm: ChartForm): ChartForApi {
  return {
    ...chartForm.owned,
    title: chartForm.title,
    description: chartForm.description,
    private: chartForm.private,
    query: chartForm.query,
    resource_id: chartForm.resource_id,
    chart_type: chartForm.chart_type ?? 'line',
    y_axis: {
      label: chartForm.y_axis.label || null,
      min: chartForm.y_axis.min ?? null,
      max: chartForm.y_axis.max ?? null,
      unit: chartForm.y_axis.unit || null,
      unit_position: chartForm.y_axis.unit_position || null,
    },
    extras: chartForm.extras,
  }
}

export function buildColumnsFromProfile(profile: { profile: TabularProfile }): Array<ColumnDefinition> {
  return profile.profile.header.map((name) => {
    const colInfo = profile.profile.columns[name]
    const isCategorical = profile.profile.categorical?.includes(name) ?? false
    // The chart stack only branches on 'number' and 'date' (continuous axis,
    // aggregatable series, time formatting): it has no notion of a year column,
    // and on an axis a year is a number.
    const resolvedType = resolveColumnType(colInfo ?? { python_type: 'unknown', format: undefined }, isCategorical)
    const colType = resolvedType === 'year' ? 'number' : resolvedType
    const colProfile = profile.profile.profile?.[name]
    return {
      name,
      type: colType,
      min: normalizeProfileNumber(colProfile?.min, colType),
      max: normalizeProfileNumber(colProfile?.max, colType),
    }
  })
}

function normalizeProfileNumber(value: number | string | undefined, type: ColumnType): number | undefined {
  if (value === undefined || value === null) return undefined
  if (type === 'date' && typeof value === 'string') {
    const timestamp = new Date(value).getTime()
    return Number.isNaN(timestamp) ? undefined : timestamp
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}
