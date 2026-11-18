import { chartContentToForm, type ChartForm } from '@datagouv/components-next'
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

  // A copy: later form edits must not mutate the message history.
  Object.assign(form, chartContentToForm(result.chart))
}

/**
 * Handler of the assistant's chart results: the only guard against applying a
 * tool call twice, so a result re-emitted later never overwrites manual edits.
 */
export function createChartResultHandler(form: () => ChartForm, selectedResource: () => string) {
  const appliedToolCalls = new Set<string>()
  return (result: ChartToolResult) => {
    if (appliedToolCalls.has(result.toolCallId)) return
    // The resource changed while the assistant was answering: the chart is for another one.
    if (result.kind === 'create' && result.chart.series[0]?.resource_id !== selectedResource()) return
    applyChartToolResult(form(), result)
    appliedToolCalls.add(result.toolCallId)
  }
}
