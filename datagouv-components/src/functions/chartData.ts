import type { TranslationFunction } from '../composables/useTranslation'
import type { Chart, ChartForApi, XAxisSortBy } from '../types/visualizations'

/** Maximum number of groups (X values) fetched and plotted for a chart. */
export const CHART_PAGE_SIZE = 50

/**
 * Stable key of the fields that drive the data fetched for a chart: presentation
 * fields (title, series type, Y axis, X sort, limit…) are left out so that
 * changing them does not refetch.
 */
export function chartDataKey(chart: Chart | ChartForApi): string {
  return JSON.stringify({
    column_x: chart.x_axis.column_x,
    series: chart.series.map(serie => ({
      resource_id: serie.resource_id,
      column_y: serie.column_y,
      aggregate_y: serie.aggregate_y,
      filters: serie.filters ?? null,
      column_x_name_override: serie.column_x_name_override ?? null,
    })),
  })
}

export function truncationWarning(xColumn: string, sortBy: XAxisSortBy | null, t: TranslationFunction): string {
  if (sortBy === 'axis_y') {
    return t('Seules les 50 premières valeurs de {x} sont prises en compte : le tri et la sélection portent sur cet extrait. Ajoutez un filtre pour réduire le nombre de valeurs.', { x: xColumn })
  }
  return t('Seules les 50 premières valeurs de {x} sont affichées.', { x: xColumn })
}
