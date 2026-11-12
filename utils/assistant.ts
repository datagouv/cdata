import type { ChartForApi, ChartForm, ColumnDefinition, DataSeries, DataSeriesType, GenericFilter, SortDirection, XAxis, TranslationFunction, XAxisSortBy, XAxisType, YAxis } from '@datagouv/components-next'

/**
 * Auto-scroll guard for the chat panel: happy-dom cannot model scroll
 * geometry, so the predicate is pure and tested on plain numbers.
 */
export function isNearChatBottom(element: { scrollTop: number, clientHeight: number, scrollHeight: number }, threshold = 80): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold
}

// Whole words of the name only: `nombre_refus` or `montant_numeraire` are measures.
const IDENTIFIER_NAME = /(?:^|[._\s-])(?:id|ref|reference|référence|num|numero|numéro)(?:$|[._\s-])/i
// The parquet profile has no distinct-value count: free text is told by its name.
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
  const date = columns.find(column => column.type === 'date' || column.type === 'year')
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
  filter: GenericFilter | null
  chart_type: DataSeriesType | null
}

export function toAssistantVisualization(
  chart: ChartForApi,
  form: Pick<ChartForm, 'filter' | 'chart_type'>,
  exists: boolean,
): AssistantVisualization {
  return {
    exists,
    title: chart.title,
    description: chart.description,
    x_axis: chart.x_axis,
    y_axis: chart.y_axis,
    series: chart.series.map(({ type, column_y, aggregate_y, resource_id, filters }) => ({ type, column_y, aggregate_y, resource_id, filters })),
    filter: form.filter ?? null,
    chart_type: form.chart_type ?? null,
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
 * Chart produced by udata's `create_chart` tool (`output.chart`).
 */
export type ChartToolChart = {
  title: string
  description: string
  x_axis: {
    column_x: string
    type: XAxisType
    sort_x_by: XAxisSortBy
    sort_x_direction: SortDirection
    limit: number | null
  }
  y_axis: {
    label: string | null
    unit: string | null
    unit_position: YAxis['unit_position']
    min: number | null
    max: number | null
  }
  series: Array<{
    type: DataSeriesType
    column_y: string
    aggregate_y: 'avg' | 'sum' | 'count' | 'min' | 'max' | null
    resource_id: string
    column_x_name_override: null
    filters: GenericFilter | null
  }>
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

export type ChartToolResult
  = | { toolCallId: string, kind: 'create', chart: ChartToolChart }
    | { toolCallId: string, kind: 'update', patch: ChartUpdatePatch }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

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
        if (!isRecord(output.chart) || !Array.isArray(output.chart.series)) continue
        results.push({
          toolCallId: part.toolCallId,
          kind: 'create',
          chart: output.chart as unknown as ChartToolChart,
        })
      }
      else if (part.type === 'tool-update_chart') {
        if (!isRecord(output.patch) || Array.isArray(output.patch)) continue
        results.push({ toolCallId: part.toolCallId, kind: 'update', patch: output.patch as ChartUpdatePatch })
      }
    }
  }

  return results
}

/**
 * Map an error surfaced by useChat to a French user-facing message, used as an
 * i18n key by the component ($t returns the key). HTTP failures carry a
 * `statusCode` (APICallError from the transport); anything else is treated as
 * a network/unknown failure.
 */
export function mapAssistantError(error: unknown): string {
  const statusCode = (error as { statusCode?: unknown } | null)?.statusCode
  if (statusCode === 401) return 'Veuillez vous reconnecter pour utiliser l’assistant.'
  // The composer caps input at the server limit: a 413 means the history grew too large.
  if (statusCode === 413) return 'La conversation est trop volumineuse.'
  if (statusCode === 429) return 'Trop de demandes, réessayez dans un instant.'
  if (statusCode === 503) return 'Assistant non configuré pour le moment.'
  return 'Une erreur est survenue, veuillez réessayer.'
}

export type ToolTraceDetail = { label: string, value: string }

export type ToolTrace = {
  type: string
  state: string
  label: string
  summary: string
  error: boolean
  errorText: string | null
  output: string | null
  details: ToolTraceDetail[]
}

export type ChatDisplayItem
  = | { kind: 'text', text: string }
    | { kind: 'thinking', text: string }
    | { kind: 'trace', trace: ToolTrace }

// Fixed French copy of the assistant UI, used as i18n keys by the components
// ($t returns the key when no catalog entry exists): ToolTrace renders
// $t(trace.label) and $t(detail.label), ChatPanel renders
// $t(mapAssistantError(error)). The literals stay here so an extraction tool
// can find them. trace.summary is shown as is: it mixes this copy with dynamic
// values (row counts, server errors), which are never translated.
const TOOL_LABELS: Record<string, { label: string, summary: string }> = {
  'tool-get_dataset_metadata': { label: 'Lecture des métadonnées', summary: 'Je consulte la fiche du jeu de données' },
  'tool-inspect_schema': { label: 'Inspection du schéma', summary: 'Je vérifie les colonnes et les types disponibles' },
  'tool-query_data': { label: 'Interrogation des données', summary: 'Je calcule la réponse à partir des données' },
  'tool-create_chart': { label: 'Création du graphique', summary: 'Je construis le graphique' },
  'tool-update_chart': { label: 'Modification du graphique', summary: 'Je modifie le graphique' },
  'tool-request_clarification': { label: 'Demande de clarification', summary: 'Je précise ce qui est ambigu' },
}

const FALLBACK_TOOL_LABEL = { label: 'Opération', summary: 'Je poursuis l’analyse' }
const QUERY_RUNNING_SUMMARY = 'Exécution en cours'
const QUERY_NOT_RUN_SUMMARY = 'Requête non exécutée'
const QUERY_MORE_GROUPS_SUMMARY = 'plus de 50 valeurs'
const CHART_CREATED_SUMMARY = 'Graphique créé'
// Openings of udata's query_data refusals: those outputs are plain sentences,
// not result tables.
const QUERY_NOT_RUN_RE = /^(Requête refusée|Requête invalide|Colonne inconnue|Le service tabulaire est indisponible|Aucune ressource active|Ressource introuvable|Action refusée)/
const QUERY_EMPTY_RE = /^Requête exécutée avec succès, aucune ligne/
const QUERY_MORE_GROUPS_RE = /Plus de 50 groupes/
// Matches the trailing notice of udata's rendered results.
const QUERY_TRUNCATED_RE = /^Résultat tronqué : (\d+)/

// The tool part failed without an errorText from the SDK.
const TOOL_ERROR_FALLBACK = 'Échec de l’opération'
const DETAIL_TRUNCATE_AT = 200
// udata returns query results as plain text tables; keep the trace readable
// without letting a huge result string bloat the DOM.
const OUTPUT_TRUNCATE_AT = 2000

function truncateAt(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit)}…` : value
}

function formatRowCount(count: number): string {
  if (count === 0) return 'Aucune ligne'
  return count === 1 ? '1 ligne' : `${count.toLocaleString('fr-FR')} lignes`
}

// Result tables are a header line, one line per row, then optional notices
// (truncation carrying the total, « Plus de 50 groupes »).
function countResultRows(output: string): number {
  if (QUERY_EMPTY_RE.test(output)) return 0
  const lines = output.split('\n').filter(line => line.trim() !== '' && !QUERY_MORE_GROUPS_RE.test(line))
  const truncated = lines[lines.length - 1]?.match(QUERY_TRUNCATED_RE)
  if (truncated) return Number(truncated[1])
  return Math.max(0, lines.length - 1) // minus the header
}

function buildQuerySummary(part: Record<string, unknown>): string {
  if (part.state !== 'output-available') return QUERY_RUNNING_SUMMARY
  if (typeof part.output !== 'string' || !part.output) return TOOL_LABELS['tool-query_data']!.summary
  if (QUERY_NOT_RUN_RE.test(part.output)) return QUERY_NOT_RUN_SUMMARY
  const rows = formatRowCount(countResultRows(part.output))
  return QUERY_MORE_GROUPS_RE.test(part.output) ? `${rows}, ${QUERY_MORE_GROUPS_SUMMARY}` : rows
}

function toolErrors(output: unknown): string | null {
  if (!isRecord(output) || output.status !== 'error') return null
  const errors = Array.isArray(output.errors) ? output.errors.filter((e): e is string => typeof e === 'string') : []
  return errors.length ? errors.join(' ; ') : TOOL_ERROR_FALLBACK
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
  const labels = fields.map(field => field.label)
  const joined = labels.length === 1
    ? labels[0]!
    : `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`
  // « modifié » agrees with the selected fields: feminine only when all are.
  const plural = fields.length > 1 || fields[0]!.plural
  const feminine = fields.every(field => field.feminine)
  const participle = `modifié${feminine ? 'e' : ''}${plural ? 's' : ''}`
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)} ${participle}`
}

function buildSummary(type: string, part: Record<string, unknown>, fallback: string): string {
  if (type === 'tool-query_data') return buildQuerySummary(part)
  if (type === 'tool-create_chart') return buildCreateSummary(part)
  if (type === 'tool-update_chart') return buildUpdateSummary(part)
  return fallback
}

function buildToolDetails(type: string, input: unknown): ToolTraceDetail[] {
  if (type !== 'tool-request_clarification' || !isRecord(input)) return []
  const question = input.question
  return typeof question === 'string' && question
    ? [{ label: 'Question', value: truncateAt(question, DETAIL_TRUNCATE_AT) }]
    : []
}

function buildToolTrace(type: string, part: Record<string, unknown>): ToolTrace {
  const labels = TOOL_LABELS[type] ?? FALLBACK_TOOL_LABEL
  const state = typeof part.state === 'string' ? part.state : ''
  const error = state === 'output-error'
  const errorText = error
    ? (typeof part.errorText === 'string' && part.errorText ? part.errorText : TOOL_ERROR_FALLBACK)
    : null

  return {
    type,
    state,
    label: labels.label,
    summary: error ? errorText! : buildSummary(type, part, labels.summary),
    error,
    errorText,
    // String outputs (udata's text tools) pass through; object outputs
    // (chart tools) are summarized only.
    output: typeof part.output === 'string' && part.output ? truncateAt(part.output, OUTPUT_TRUNCATE_AT) : null,
    details: buildToolDetails(type, part.input),
  }
}

/**
 * Turn a message's parts into display items: text parts pass through,
 * consecutive reasoning parts (AI SDK type 'reasoning') are grouped into one
 * thinking item, and each tool part becomes its own trace — the AI SDK emits
 * one part per tool call (keyed by toolCallId) and mutates its state in place,
 * so no merging is ever needed.
 */
export function buildChatDisplayItems(parts: unknown[]): ChatDisplayItem[] {
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

    items.push({ kind: 'trace', trace: buildToolTrace(part.type, part) })
  }

  return items
}
