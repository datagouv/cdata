import type { Chart, ChartForm, ChartForApi, DataSeries, GenericFilter, ColumnDefinition, YAxis } from '../types/visualizations'
import type { ColumnType, TabularColumnProfile, TabularProfile } from '../components/TabularExplorer/types'
import type { TranslationFunction } from '../composables/useTranslation'
import { resolveColumnType } from './tabular'

export function toChartForm(chart: Chart) {
  // The form has one filter shared by every series: `filter` is its only source.
  const seriesFilter: GenericFilter | null = chart.series[0]?.filters ?? null

  return {
    title: chart.title,
    description: chart.description,
    private: chart.private,
    owned: chart.organization ? { organization: chart.organization.id, owner: null } : { owner: chart.owner.id, organization: null },
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
      min: chart.y_axis.min,
      max: chart.y_axis.max,
      unit: chart.y_axis.unit || '',
      unit_position: chart.y_axis.unit_position || 'suffix',
    },
    series: chart.series.map(serie => ({
      ...serie,
      aggregate_y: serie.aggregate_y || '',
      filters: null,
    })),
    extras: chart.extras,
    chart_type: chart.series[0] ? chart.series[0].type : null,
    filter: seriesFilter ?? null,
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
      distinctValues: distinctValues(colProfile),
    }
  })
}

// The profile leaves nb_distinct at 0 for the columns it does not count, free text among them.
function distinctValues(colProfile: TabularColumnProfile | undefined): number | undefined {
  if (!colProfile?.nb_distinct) return undefined
  return colProfile.nb_distinct + (colProfile.nb_missing_values > 0 ? 1 : 0)
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

/** Y axis tick label: full number in the locale (no rounding), with the chart unit. */
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
