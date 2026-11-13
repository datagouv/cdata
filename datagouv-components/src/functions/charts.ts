import type { Chart, ChartForm, ChartForApi, DataSeries, GenericFilter, ColumnDefinition, YAxis } from '../types/visualizations'
import type { ColumnType, TabularProfile } from '../components/TabularExplorer/types'
import type { TranslationFunction } from '../composables/useTranslation'
import { resolveColumnType } from './tabular'

// Size of the saved chart image: twice the 224×160 media box of ChartCard (ObjectCard
// media-size="xl"), which the API brings back within 250px. Fixed, so the preview size
// on screen does not matter.
export const CHART_IMAGE_WIDTH = 448
export const CHART_IMAGE_HEIGHT = 320

/** What a chart shows, without its owner, privacy or extras: what the assistant creates too. */
export type ChartContent = Pick<Chart, 'title' | 'description' | 'x_axis' | 'y_axis' | 'series'>

/**
 * The form fields of a chart content. The form has one filter shared by every
 * series, read from the first one, and its own copy of it. A count series counts
 * the X column by convention: its column_y is pointed at it.
 */
export function chartContentToForm(chart: ChartContent) {
  const seriesFilter: GenericFilter | null = chart.series[0]?.filters ?? null

  return {
    title: chart.title,
    description: chart.description,
    x_axis: {
      column_x: chart.x_axis.column_x,
      type: chart.x_axis.type,
      limit: chart.x_axis.limit ?? null,
      sort_combined: chart.x_axis.sort_x_by && chart.x_axis.sort_x_direction
        ? `${chart.x_axis.sort_x_by}-${chart.x_axis.sort_x_direction}`
        : '',
    },
    y_axis: {
      label: chart.y_axis.label || '',
      min: chart.y_axis.min ?? null,
      max: chart.y_axis.max ?? null,
      unit: chart.y_axis.unit || '',
      unit_position: chart.y_axis.unit_position || 'suffix',
    },
    // Field by field: a series from the assistant may carry keys the form does not know.
    series: chart.series.map(serie => ({
      type: serie.type,
      column_y: serie.aggregate_y === 'count' ? chart.x_axis.column_x : serie.column_y,
      aggregate_y: serie.aggregate_y || '',
      resource_id: serie.resource_id,
      column_x_name_override: serie.column_x_name_override,
      filters: null,
    })),
    chart_type: chart.series[0]?.type ?? null,
    filter: seriesFilter ? JSON.parse(JSON.stringify(seriesFilter)) as GenericFilter : null,
  } satisfies Omit<ChartForm, 'private' | 'owned' | 'extras'>
}

export function toChartForm(chart: Chart) {
  return {
    ...chartContentToForm(chart),
    private: chart.private,
    owned: chart.organization ? { organization: chart.organization.id, owner: null } : { owner: chart.owner.id, organization: null },
    extras: chart.extras,
  } satisfies ChartForm
}

export function toChartApi(chartForm: ChartForm): ChartForApi {
  const xAxis = {
    column_x: chartForm.x_axis.column_x,
    type: chartForm.x_axis.type,
    limit: chartForm.x_axis.limit ?? null,
    sort_x_by: chartForm.x_axis.sort_combined
      ? (chartForm.x_axis.sort_combined.split('-')[0] as 'axis_x' | 'axis_y')
      : null,
    sort_x_direction: chartForm.x_axis.sort_combined
      ? (chartForm.x_axis.sort_combined.split('-')[1] as 'asc' | 'desc')
      : null,
  }

  return {
    ...chartForm.owned,
    title: chartForm.title,
    description: chartForm.description,
    private: chartForm.private,
    x_axis: xAxis,
    y_axis: {
      label: chartForm.y_axis.label ?? null,
      min: chartForm.y_axis.min ?? null,
      max: chartForm.y_axis.max ?? null,
      unit: chartForm.y_axis.unit ?? null,
      unit_position: chartForm.y_axis.unit_position ?? null,
    },
    series: chartForm.series.map(serie => ({
      ...serie,
      type: chartForm.chart_type ?? serie.type,
      aggregate_y: serie.aggregate_y || null,
      filters: chartForm.filter ?? null,
    })),
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

/** Y axis tick label in the locale, with the chart unit: abbreviated from a thousand on (1,2 k, 3,45 M). */
export function formatYAxisValue(value: number, locale: string, yAxis: Pick<YAxis, 'unit' | 'unit_position'>): string {
  // Two compact fraction digits keep close ticks (1,22 M / 1,24 M) apart.
  const options: Intl.NumberFormatOptions = Math.abs(value) >= 1000
    ? { notation: 'compact', maximumFractionDigits: 2 }
    : { maximumFractionDigits: 10 }
  const formatted = new Intl.NumberFormat(locale, options).format(value)
  if (!yAxis.unit) return formatted
  return yAxis.unit_position === 'prefix' ? `${yAxis.unit} ${formatted}` : `${formatted} ${yAxis.unit}`
}

/** Legend and tooltip name of a series: the calculation spelled out, not the `column__sum` key. */
export function seriesLabel(serie: Pick<DataSeries, 'column_y' | 'aggregate_y'>, t: TranslationFunction): string {
  switch (serie.aggregate_y) {
    case 'sum': return t('Somme de {column}', { column: serie.column_y })
    case 'avg': return t('Moyenne de {column}', { column: serie.column_y })
    case 'min': return t('Minimum de {column}', { column: serie.column_y })
    case 'max': return t('Maximum de {column}', { column: serie.column_y })
    // A count series counts the rows of each X value: its column is the X column.
    case 'count': return t('Nombre de lignes')
    default: return serie.column_y
  }
}
