import { isRecord } from '@datagouv/components-next'
import type { ChartContent, ChartForApi, DataSeries, DataSeriesType, XAxis, YAxis } from '@datagouv/components-next'

/**
 * Auto-scroll guard for the chat panel: happy-dom cannot model scroll
 * geometry, so the predicate is pure and tested on plain numbers.
 */
export function isNearChatBottom(element: { scrollTop: number, clientHeight: number, scrollHeight: number }, threshold = 80): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold
}

/**
 * What the assistant sees of the current chart: the fields it can reason
 * about, never ownership, visibility or extras. `exists` tells a saved chart
 * (or one being edited) from a new one.
 */
export type AssistantVisualization = {
  exists: boolean
  title: string
  description: string
  x_axis: XAxis
  y_axis: YAxis
  series: Array<Pick<DataSeries, 'type' | 'column_y' | 'aggregate_y' | 'resource_id' | 'filters'>>
}

export function toAssistantVisualization(chart: ChartForApi, exists: boolean): AssistantVisualization {
  return {
    exists,
    title: chart.title,
    description: chart.description,
    x_axis: chart.x_axis,
    y_axis: chart.y_axis,
    series: chart.series.map(({ type, column_y, aggregate_y, resource_id, filters }) => ({ type, column_y, aggregate_y, resource_id, filters })),
  }
}

/**
 * Partial chart change produced by udata's `update_chart` tool (`output.patch`).
 */
export type ChartUpdatePatch = {
  title?: string
  description?: string
  type?: DataSeriesType
  y_axis?: Partial<YAxis>
}

/** `chart` is the output of udata's `create_chart` tool, `patch` that of `update_chart`. */
export type ChartToolResult
  = | { toolCallId: string, kind: 'create', chart: ChartContent }
    | { toolCallId: string, kind: 'update', patch: ChartUpdatePatch }

/**
 * Successful `create_chart` / `update_chart` results of a conversation, in
 * message order. Only finished tool parts (`output-available`) whose output
 * has `status === 'ok'` and the minimal expected shape are returned; errors,
 * running calls and malformed outputs are skipped.
 */
export function chartToolResults(messages: unknown[]): ChartToolResult[] {
  const results: ChartToolResult[] = []

  for (const message of messages) {
    if (!isRecord(message) || !Array.isArray(message.parts)) continue

    for (const part of message.parts) {
      if (!isRecord(part) || part.state !== 'output-available' || typeof part.toolCallId !== 'string') continue
      const output = part.output
      if (!isRecord(output) || output.status !== 'ok') continue

      if (part.type === 'tool-create_chart') {
        const chart = output.chart
        // Turned into form fields right away: an axis or a series that is not an object would throw there.
        if (!isRecord(chart) || !isRecord(chart.x_axis) || !isRecord(chart.y_axis)
          || !Array.isArray(chart.series) || !chart.series.every(isRecord)) continue
        results.push({
          toolCallId: part.toolCallId,
          kind: 'create',
          chart: chart as unknown as ChartContent,
        })
      }
      else if (part.type === 'tool-update_chart') {
        if (!isRecord(output.patch)) continue
        results.push({ toolCallId: part.toolCallId, kind: 'update', patch: output.patch as ChartUpdatePatch })
      }
    }
  }

  return results
}
