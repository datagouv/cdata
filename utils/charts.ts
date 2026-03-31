import type { Chart, ChartForm, ChartForApi } from '@datagouv/components-next'

export function toChartForm(chart: Chart) {
  const seriesFilter = chart.series[0]?.filters as Filter | null
  
  return {
    title: chart.title,
    description: chart.description,
    private: chart.private,
    owned: chart.organization ? { organization: chart.organization.id, owner: null } : { owner: chart.owner.id, organization: null },
    x_axis: {
      column_x: chart.x_axis.column_x,
      type: chart.x_axis.type,
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
    })),
    extras: chart.extras,
    chart_type: chart.series.length > 0 ? chart.series[0].type : null,
    filter: seriesFilter && 'column' in seriesFilter ? seriesFilter : undefined,
  } satisfies ChartForm
}

export function toChartApi(chartForm: ChartForm): ChartForApi {
  return {
    ...chartForm.owned,
    title: chartForm.title,
    description: chartForm.description,
    private: chartForm.private,
    x_axis: {
      column_x: chartForm.x_axis.column_x,
      type: chartForm.x_axis.type,
      sort_x_by: chartForm.x_axis.sort_combined
        ? (chartForm.x_axis.sort_combined.split('-')[0] as 'axis_x' | 'axis_y')
        : null,
      sort_x_direction: chartForm.x_axis.sort_combined
        ? (chartForm.x_axis.sort_combined.split('-')[1] as 'asc' | 'desc')
        : null,
    },
    y_axis: {
      label: chartForm.y_axis.label ?? null,
      min: chartForm.y_axis.min ?? null,
      max: chartForm.y_axis.max ?? null,
      unit: chartForm.y_axis.unit ?? null,
      unit_position: chartForm.y_axis.unit_position ?? null,
    },
    series: chartForm.series.map((serie, index) => ({
      ...serie,
      type: index === 0 && chartForm.chart_type ? chartForm.chart_type : serie.type,
      aggregate_y: serie.aggregate_y || null,
      filters: index === 0 && chartForm.filter ? chartForm.filter : serie.filters,
    })),
    extras: chartForm.extras,
  }
}
