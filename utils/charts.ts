import type { Chart, ChartForm, ChartForApi } from '@datagouv/components-next'

export function toChartForm(chart: Chart) {
  return {
    title: chart.title,
    description: chart.description,
    private: chart.private,
    owned: chart.organization ? { organization: chart.organization.id, owner: null } : { owner: chart.owner.id, organization: null },
    x_axis: {
      column_x: chart.x_axis.column_x,
      type: chart.x_axis.type,
      sort_x_by: chart.x_axis.sort_x_by || '',
      sort_x_direction: chart.x_axis.sort_x_direction || 'asc',
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
      sort_x_by: chartForm.x_axis.sort_x_by || null,
      sort_x_direction: chartForm.x_axis.sort_x_direction || null,
    },
    y_axis: {
      label: chartForm.y_axis.label ?? null,
      min: chartForm.y_axis.min ?? null,
      max: chartForm.y_axis.max ?? null,
      unit: chartForm.y_axis.unit ?? null,
      unit_position: chartForm.y_axis.unit_position ?? null,
    },
    series: chartForm.series.map(serie => ({
      ...serie,
      aggregate_y: serie.aggregate_y || null,
    })),
    extras: chartForm.extras,
  }
}
