import type { TranslationFunction } from '../composables/useTranslation'
import type { Chart, ChartForApi, SortDirection, XAxisSortBy } from '../types/visualizations'

/** Maximum number of groups (X values) fetched and plotted for a chart. */
export const CHART_PAGE_SIZE = 50

/**
 * Order of the X values requested from tabular-api: it decides which groups
 * are fetched. A descending X sort asks for the last X values; a Y sort is
 * applied by the viewer on the fetched groups, so it does not change it.
 */
export function chartRequestSortDirection(chart: Chart | ChartForApi): SortDirection {
  return chart.x_axis.sort_x_by === 'axis_x' && chart.x_axis.sort_x_direction === 'desc' ? 'desc' : 'asc'
}

/**
 * Stable key of the fields that drive the data fetched for a chart: presentation
 * fields (title, series type, Y axis, Y sort, limit…) are left out so that
 * changing them does not refetch. The X sort only counts through the request
 * direction.
 */
export function chartDataKey(chart: Chart | ChartForApi): string {
  return JSON.stringify({
    column_x: chart.x_axis.column_x,
    sort: chartRequestSortDirection(chart),
    series: chart.series.map(serie => ({
      resource_id: serie.resource_id,
      column_y: serie.column_y,
      aggregate_y: serie.aggregate_y,
      filters: serie.filters ?? null,
      column_x_name_override: serie.column_x_name_override ?? null,
    })),
  })
}

/**
 * Whether a series has more X values than the CHART_PAGE_SIZE fetched, from its first
 * page: api-tabular sends the total of a raw query but not of an aggregate, whose next
 * link is exact from the exact-next-link version on and sent for any full page before.
 * 'probe' when only a request for the next group can tell.
 */
export function groupsBeyondPage({ rowCount, aggregated, total, next }: {
  rowCount: number
  aggregated: boolean
  total?: number | undefined
  next?: string | null | undefined
}): boolean | 'probe' {
  if (rowCount < CHART_PAGE_SIZE) return false
  if (!aggregated && total !== undefined) return total > CHART_PAGE_SIZE
  return next ? 'probe' : false
}

export function truncationWarning(xColumn: string, sortBy: XAxisSortBy | null, t: TranslationFunction): string {
  if (sortBy === 'axis_y') {
    return t('Seules les {n} premières valeurs de {x} sont prises en compte : le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.', { n: CHART_PAGE_SIZE, x: xColumn })
  }
  return t('Seules les {n} premières valeurs de {x} sont affichées.', { n: CHART_PAGE_SIZE, x: xColumn })
}
