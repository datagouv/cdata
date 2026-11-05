import type { ChartForm } from '@datagouv/components-next'
import type { ChartToolResult } from '~/utils/assistant'

/**
 * Apply a successful assistant tool result to the chart form, in place (the
 * form is a reactive v-model object). Owner, privacy and extras are untouched.
 */
export function applyChartToolResult(form: ChartForm, result: ChartToolResult): void {
  if (result.kind === 'update') {
    const { patch } = result
    if (patch.title !== undefined) form.title = patch.title
    if (patch.description !== undefined) form.description = patch.description
    if (patch.type !== undefined) form.chart_type = patch.type
    if (patch.y_axis) {
      const y = patch.y_axis
      if ('label' in y) form.y_axis.label = y.label ?? ''
      if ('unit' in y) form.y_axis.unit = y.unit ?? ''
      if ('unit_position' in y && y.unit_position) form.y_axis.unit_position = y.unit_position
      if ('min' in y) form.y_axis.min = y.min ?? null
      if ('max' in y) form.y_axis.max = y.max ?? null
    }
    return
  }

  const { chart } = result
  const first = chart.series[0]
  form.title = chart.title
  form.description = chart.description
  form.chart_type = first?.type ?? form.chart_type
  // Deep copy: later form edits must not mutate the message history.
  form.filter = first?.filters ? JSON.parse(JSON.stringify(first.filters)) : null
  form.x_axis = {
    column_x: chart.x_axis.column_x,
    type: chart.x_axis.type,
    limit: chart.x_axis.limit ?? null,
    sort_combined: chart.x_axis.sort_x_by && chart.x_axis.sort_x_direction
      ? `${chart.x_axis.sort_x_by}-${chart.x_axis.sort_x_direction}`
      : '',
  }
  form.series = chart.series.map(serie => ({
    type: serie.type,
    column_y: serie.column_y,
    aggregate_y: serie.aggregate_y ?? '',
    resource_id: serie.resource_id,
    column_x_name_override: null,
    filters: null,
  }))
  if (chart.y_axis) {
    form.y_axis = {
      label: chart.y_axis.label ?? '',
      unit: chart.y_axis.unit ?? '',
      unit_position: chart.y_axis.unit_position || 'suffix',
      min: chart.y_axis.min,
      max: chart.y_axis.max,
    }
  }
}
