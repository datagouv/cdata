import { humanJoin, isRecord } from '@datagouv/components-next'
import type { ChartContent, ChartForApi, ColumnDefinition, DataSeries, DataSeriesType, XAxis, TranslationFunction, YAxis } from '@datagouv/components-next'

/**
 * Auto-scroll guard for the chat panel: happy-dom cannot model scroll
 * geometry, so the predicate is pure and tested on plain numbers.
 */
export function isNearChatBottom(element: { scrollTop: number, clientHeight: number, scrollHeight: number }, threshold = 80): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold
}

// Whole words of the name only: `nombre_refus` or `montant_numeraire` are measures.
const IDENTIFIER_NAME = /(?:^|[._\s-])(?:id|ref|reference|référence|num|numero|numéro)(?:$|[._\s-])/i
// A ColumnDefinition carries no distinct-value count (nb_distinct): free text is told by its name.
const FREE_TEXT_NAME = /(?:url|uri|description|comment|adresse|address|geometry|geojson|wkt|libell?e_long|libellé_long|(?:^|[._\s-])(?:title|titre)(?:$|[._\s-]))/i

function isUsefulDimension(column: ColumnDefinition) {
  return ['categorical', 'text', 'boolean'].includes(column.type)
    && !IDENTIFIER_NAME.test(column.name)
    && !FREE_TEXT_NAME.test(column.name)
}

function isUsefulMeasure(column: ColumnDefinition) {
  return column.type === 'number'
    && !IDENTIFIER_NAME.test(column.name)
    && !/(?:code|year|annee|année|latitude|longitude|\blat\b|\blon\b|\blng\b)/i.test(column.name)
}

/**
 * Suggestions of the empty assistant, built from the resource schema. They ask
 * for charts the assistant can build (histogram or line, count or aggregate,
 * top N), not for data exploration: the assistant only creates charts.
 */
export function getStarterQuestions(columns: Array<ColumnDefinition>, t: TranslationFunction): Array<string> {
  // csv-detective marks the columns with few distinct values as categorical.
  const [dimension, secondDimension] = columns.filter(isUsefulDimension)
    .sort((a, b) => Number(b.type === 'categorical') - Number(a.type === 'categorical'))
  const measure = columns.find(isUsefulMeasure)
  const date = columns.find(column => column.type === 'date')
  const suggestions = [t('Quel graphique peut-on faire avec ces données ?')]

  if (dimension && measure) {
    suggestions.push(t('Fais un histogramme de la somme de « {measure} » par « {dimension} »', { measure: measure.name, dimension: dimension.name }))
  }
  if (dimension) {
    // No « top 10 »: the chart ranks only the first CHART_PAGE_SIZE groups in X order.
    suggestions.push(t('Compte les lignes par « {column} »', { column: dimension.name }))
  }
  if (date) {
    suggestions.push(measure
      ? t('Trace l’évolution de « {measure} » selon « {date} »', { measure: measure.name, date: date.name })
      : t('Trace l’évolution du nombre de lignes selon « {date} »', { date: date.name }))
  }
  else if (dimension && measure) {
    suggestions.push(t('Montre la moyenne de « {measure} » par « {dimension} »', { dimension: dimension.name, measure: measure.name }))
  }
  else if (secondDimension) {
    suggestions.push(t('Compare le nombre de lignes par « {column} »', { column: secondDimension.name }))
  }
  if (suggestions.length < 3) {
    suggestions.push(t('Propose-moi un graphique pertinent pour cette ressource'))
  }
  return suggestions
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
 * Build the assistant chat request body, including the protocol fields required
 * by udata's VercelAIAdapter (SubmitMessage discriminated union). `resource_id`
 * is only sent when a resource is selected and `visualization` (the current
 * chart, see `toAssistantVisualization`) only when there is one.
 */
export function buildChatBody(
  messages: unknown[],
  resourceId: string | null,
  visualization: AssistantVisualization | null,
  protocol?: { id: string, trigger: string, messageId?: string },
): { messages: unknown[], id?: string, trigger?: string, messageId?: string, resource_id?: string, visualization?: AssistantVisualization } {
  return {
    ...protocol,
    messages,
    ...(resourceId ? { resource_id: resourceId } : {}),
    ...(visualization ? { visualization } : {}),
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

export type ToolTrace = {
  label: string
  summary: string
  error: boolean
  errorText: string | null
  output: string | null
}

export type ChatDisplayItem
  = | { kind: 'text', text: string }
    | { kind: 'thinking', text: string }
    | { kind: 'trace', trace: ToolTrace }

// Fixed French copy of the assistant UI, used as i18n keys by the components
// ($t returns the key when no catalog entry exists): ToolTrace renders
// $t(trace.label). The literals stay here so an extraction tool can find them. trace.summary is shown as is: it mixes this copy with dynamic
// values (row counts, server errors), which are never translated.
const TOOL_LABELS: Record<string, { label: string, summary: string }> = {
  'tool-get_dataset_metadata': { label: 'Lecture des métadonnées', summary: 'Je consulte la fiche du jeu de données' },
  'tool-inspect_schema': { label: 'Inspection du schéma', summary: 'Je vérifie les colonnes et les types disponibles' },
  'tool-query_data': { label: 'Interrogation des données', summary: 'Je calcule la réponse à partir des données' },
  'tool-create_chart': { label: 'Création du graphique', summary: 'Je construis le graphique' },
  'tool-update_chart': { label: 'Modification du graphique', summary: 'Je modifie le graphique' },
}

const FALLBACK_TOOL_LABEL = { label: 'Opération', summary: 'Je poursuis l’analyse' }
const QUERY_RUNNING_SUMMARY = 'Exécution en cours'
const QUERY_NOT_RUN_SUMMARY = 'Requête non exécutée'
const QUERY_MORE_GROUPS_SUMMARY = 'plus de 50 valeurs'
const CHART_CREATED_SUMMARY = 'Graphique créé'

// The tool part failed without an errorText from the SDK.
const TOOL_ERROR_FALLBACK = 'Échec de l’opération'
// query_data results carry a plain text table; keep the trace readable
// without letting a huge result bloat the DOM.
const OUTPUT_TRUNCATE_AT = 2000

function truncateAt(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit)}…` : value
}

function formatRowCount(count: number, locale: string): string {
  if (count === 0) return 'Aucune ligne'
  return count === 1 ? '1 ligne' : `${count.toLocaleString(locale)} lignes`
}

function toolErrors(output: unknown): string | null {
  if (!isRecord(output) || output.status !== 'error') return null
  const errors = Array.isArray(output.errors) ? output.errors.filter((e): e is string => typeof e === 'string') : []
  return errors.length ? errors.join(' ; ') : TOOL_ERROR_FALLBACK
}

// `total` is the exact row count, known only without an aggregate; `rows` is
// what the table shows.
function buildQuerySummary(part: Record<string, unknown>, locale: string): string {
  if (part.state !== 'output-available') return QUERY_RUNNING_SUMMARY
  const output = part.output
  if (!isRecord(output)) return TOOL_LABELS['tool-query_data']!.summary
  if (output.status === 'error') return QUERY_NOT_RUN_SUMMARY
  const count = typeof output.total === 'number' ? output.total : output.rows
  if (output.status !== 'ok' || typeof count !== 'number') return TOOL_LABELS['tool-query_data']!.summary
  const rows = formatRowCount(count, locale)
  return output.more_groups === true ? `${rows}, ${QUERY_MORE_GROUPS_SUMMARY}` : rows
}

// query_data shows its result table, or its errors when the query was not run.
// Chart tools' outputs are summarized only.
function buildToolOutput(type: string, output: unknown): string | null {
  if (type !== 'tool-query_data' || !isRecord(output)) return null
  const text = output.status === 'error' ? toolErrors(output) : output.table
  return typeof text === 'string' && text ? truncateAt(text, OUTPUT_TRUNCATE_AT) : null
}

function buildCreateSummary(part: Record<string, unknown>): string {
  if (part.state !== 'output-available') return TOOL_LABELS['tool-create_chart']!.summary
  return toolErrors(part.output) ?? CHART_CREATED_SUMMARY
}

type PatchField = { label: string, feminine?: boolean, plural?: boolean, changed: (patch: Record<string, unknown>) => boolean }

const PATCH_FIELDS: PatchField[] = [
  { label: 'titre', changed: patch => 'title' in patch },
  { label: 'description', feminine: true, changed: patch => 'description' in patch },
  { label: 'type', changed: patch => 'type' in patch },
  { label: 'libellé de l’axe Y', changed: patch => isRecord(patch.y_axis) && 'label' in patch.y_axis },
  { label: 'unité', feminine: true, changed: patch => isRecord(patch.y_axis) && 'unit' in patch.y_axis },
  { label: 'bornes', feminine: true, plural: true, changed: patch => isRecord(patch.y_axis) && ('min' in patch.y_axis || 'max' in patch.y_axis) },
]

function buildUpdateSummary(part: Record<string, unknown>): string {
  const fallback = TOOL_LABELS['tool-update_chart']!.summary
  if (part.state !== 'output-available' || !isRecord(part.output)) return fallback
  const errors = toolErrors(part.output)
  if (errors) return errors
  if (!isRecord(part.output.patch)) return fallback

  const patch = part.output.patch
  const fields = PATCH_FIELDS.filter(field => field.changed(patch))
  if (fields.length === 0) return fallback
  const joined = humanJoin(fields.map(field => field.label))
  // « modifié » agrees with the selected fields: feminine only when all are.
  const plural = fields.length > 1 || fields[0]!.plural
  const feminine = fields.every(field => field.feminine)
  const participle = `modifié${feminine ? 'e' : ''}${plural ? 's' : ''}`
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)} ${participle}`
}

function buildSummary(type: string, part: Record<string, unknown>, fallback: string, locale: string): string {
  if (type === 'tool-query_data') return buildQuerySummary(part, locale)
  if (type === 'tool-create_chart') return buildCreateSummary(part)
  if (type === 'tool-update_chart') return buildUpdateSummary(part)
  return fallback
}

function buildToolTrace(type: string, part: Record<string, unknown>, locale: string): ToolTrace {
  const labels = TOOL_LABELS[type] ?? FALLBACK_TOOL_LABEL
  const error = part.state === 'output-error'
  const errorText = error
    ? (typeof part.errorText === 'string' && part.errorText ? part.errorText : TOOL_ERROR_FALLBACK)
    : null

  return {
    label: labels.label,
    summary: error ? errorText! : buildSummary(type, part, labels.summary, locale),
    error,
    errorText,
    output: buildToolOutput(type, part.output),
  }
}

/**
 * Turn a message's parts into display items: text parts pass through,
 * consecutive reasoning parts (AI SDK type 'reasoning') are grouped into one
 * thinking item, and each tool part becomes its own trace — the AI SDK emits
 * one part per tool call (keyed by toolCallId) and mutates its state in place,
 * so no merging is ever needed.
 */
export function buildChatDisplayItems(parts: unknown[], locale: string): ChatDisplayItem[] {
  const items: ChatDisplayItem[] = []

  for (const part of parts) {
    if (!isRecord(part) || typeof part.type !== 'string') continue

    if (part.type === 'text') {
      if (typeof part.text === 'string' && part.text) items.push({ kind: 'text', text: part.text })
      continue
    }
    if (part.type === 'reasoning') {
      if (typeof part.text !== 'string' || !part.text) continue
      const last = items[items.length - 1]
      if (last?.kind === 'thinking') {
        last.text += part.text
        continue
      }
      items.push({ kind: 'thinking', text: part.text })
      continue
    }
    if (!part.type.startsWith('tool-')) continue

    items.push({ kind: 'trace', trace: buildToolTrace(part.type, part, locale) })
  }

  return items
}
