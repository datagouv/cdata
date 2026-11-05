/**
 * Auto-scroll guard for the chat panel: happy-dom cannot model scroll
 * geometry, so the predicate is pure and tested on plain numbers.
 */
export function isNearChatBottom(element: { scrollTop: number, clientHeight: number, scrollHeight: number }, threshold = 80): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold
}

/**
 * Extract the content of the last fenced ```sql block of a text, or null.
 * The fence language is matched case-insensitively.
 */
export function extractLastSqlBlock(text: string): string | null {
  const matches = [...text.matchAll(/```sql\s*\r?\n([\s\S]*?)```/gi)]
  if (matches.length === 0) return null
  return matches[matches.length - 1][1].trim()
}

/**
 * Build the assistant chat request body, including the protocol fields required
 * by udata's VercelAIAdapter (SubmitMessage discriminated union). The optional
 * `resource_id` context is only sent when a resource is selected.
 */
export function buildChatBody(messages: unknown[], resourceId: string | null, protocol?: { id: string, trigger: string, messageId?: string }): { messages: unknown[], id?: string, trigger?: string, messageId?: string, resource_id?: string } {
  return {
    ...protocol,
    messages,
    ...(resourceId ? { resource_id: resourceId } : {}),
  }
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
  if (statusCode === 429) return 'Quota journalier dépassé, réessayez demain.'
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
  code: string | null
  output: string | null
  details: ToolTraceDetail[]
}

export type ChatDisplayItem
  = | { kind: 'text', text: string }
    | { kind: 'thinking', text: string }
    | { kind: 'trace', trace: ToolTrace }

// Fixed French copy of the assistant UI, used as i18n keys by the components
// ($t returns the key when no catalog entry exists): ToolTrace renders
// $t(trace.label), $t(trace.summary) and $t(detail.label), ChatPanel renders
// $t(mapAssistantError(error)). The literals stay here so an extraction tool
// can find them; dynamic values (SQL, column names) are never translated.
const TOOL_LABELS: Record<string, { label: string, summary: string }> = {
  'tool-get_dataset_metadata': { label: 'Lecture des métadonnées', summary: 'Je consulte la fiche du jeu de données' },
  'tool-inspect_schema': { label: 'Inspection du schéma', summary: 'Je vérifie les colonnes et les types disponibles' },
  'tool-execute_sql': { label: 'Exécution de la requête SQL', summary: 'Je calcule la réponse à partir des données' },
  'tool-request_clarification': { label: 'Demande de clarification', summary: 'Je précise ce qui est ambigu' },
}

const FALLBACK_TOOL_LABEL = { label: 'Opération', summary: 'Je poursuis l’analyse' }
const SQL_RUNNING_SUMMARY = 'Exécution en cours'
// Matches the trailing notice of udata's rendered SQL results.
const SQL_TRUNCATED_RE = /^Résultat tronqué : (\d+)/

const SQL_NOT_RUN_SUMMARY = 'Requête non exécutée'
// Openings of udata's execute_sql refusals and failures: those outputs are
// plain sentences, not result tables.
const SQL_NOT_RUN_RE = /^(Requête refusée|Action refusée|Ressource introuvable|L['’]exécution de la requête a échoué)/
const SQL_EMPTY_RE = /^Requête exécutée avec succès, aucune ligne/

// udata renders SQL results as a pipe table: header line, one line per row,
// then an optional truncation notice carrying the total row count.
function countSqlResultRows(output: string): number {
  if (SQL_EMPTY_RE.test(output)) return 0
  const lines = output.split('\n')
  const last = lines[lines.length - 1] ?? ''
  const truncated = last.match(SQL_TRUNCATED_RE)
  if (truncated) return Number(truncated[1])
  return Math.max(0, lines.filter(line => line.trim() !== '').length - 1) // minus the header
}

function formatRowCount(count: number): string {
  if (count === 0) return 'Aucune ligne'
  return count === 1 ? '1 ligne' : `${count.toLocaleString('fr-FR')} lignes`
}

function buildSqlSummary(part: Record<string, unknown>): string {
  if (part.state !== 'output-available') return SQL_RUNNING_SUMMARY
  if (typeof part.output !== 'string' || !part.output) return TOOL_LABELS['tool-execute_sql']!.summary
  if (SQL_NOT_RUN_RE.test(part.output)) return SQL_NOT_RUN_SUMMARY
  return formatRowCount(countSqlResultRows(part.output))
}
// The tool part failed without an errorText from the SDK.
const TOOL_ERROR_FALLBACK = 'Échec de l’opération'
const DETAIL_TRUNCATE_AT = 200
const FLATTENED_DETAIL_LIMIT = 8
// udata returns tool outputs as plain text tables; keep the trace readable
// without letting a huge result string bloat the DOM.
const OUTPUT_TRUNCATE_AT = 2000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function truncateAt(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit)}…` : value
}

function truncateValue(value: string): string {
  return truncateAt(value, DETAIL_TRUNCATE_AT)
}

function formatDetailValue(value: unknown): string {
  if (typeof value === 'string') return truncateValue(value)
  if (typeof value === 'number') return value.toLocaleString('fr-FR')
  return truncateValue(String(value))
}

function toolDetail(output: Record<string, unknown>, key: string, label: string): ToolTraceDetail | null {
  const value = output[key]
  if (value === undefined || value === null || value === '') return null
  if (Array.isArray(value)) {
    return value.length ? { label, value: truncateValue(value.map(String).join(', ')) } : null
  }
  return { label, value: formatDetailValue(value) }
}

// Compact key/value details derived from the tool input/output. Known shapes
// get proper French labels; anything else falls back to a flattened list of
// scalar output values — never a raw JSON dump.
function buildToolDetails(type: string, input: unknown, output: unknown): ToolTraceDetail[] {
  const details: ToolTraceDetail[] = []
  const out = isRecord(output) ? output : {}
  const push = (detail: ToolTraceDetail | null) => {
    if (detail) details.push(detail)
  }

  if (type === 'tool-inspect_schema') {
    push(toolDetail(out, 'rowCount', 'Lignes'))
    push(toolDetail(out, 'columns', 'Colonnes'))
  }
  else if (type === 'tool-get_dataset_metadata') {
    push(toolDetail(out, 'title', 'Titre'))
    push(toolDetail(out, 'organization', 'Producteur'))
    push(toolDetail(out, 'license', 'Licence'))
    if (Array.isArray(out.resources) && out.resources.length) {
      push({ label: 'Ressources', value: out.resources.length.toLocaleString('fr-FR') })
    }
  }
  else if (type === 'tool-execute_sql') {
    push(toolDetail(out, 'rowCount', 'Lignes'))
    push(toolDetail(out, 'columns', 'Colonnes'))
  }
  else if (type === 'tool-request_clarification') {
    const inp = isRecord(input) ? input : {}
    push(toolDetail(inp, 'question', 'Question'))
  }

  if (details.length === 0 && isRecord(output)) {
    for (const [key, value] of Object.entries(output)) {
      if (details.length >= FLATTENED_DETAIL_LIMIT) break
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        push({ label: key, value: formatDetailValue(value) })
      }
    }
  }
  return details
}

function buildToolTrace(type: string, part: Record<string, unknown>): ToolTrace {
  const labels = TOOL_LABELS[type] ?? FALLBACK_TOOL_LABEL
  const state = typeof part.state === 'string' ? part.state : ''
  const error = state === 'output-error'
  const errorText = error
    ? (typeof part.errorText === 'string' && part.errorText ? part.errorText : TOOL_ERROR_FALLBACK)
    : null
  const input = isRecord(part.input) ? part.input : undefined

  return {
    type,
    state,
    label: labels.label,
    summary: error ? errorText! : (type === 'tool-execute_sql' ? buildSqlSummary(part) : labels.summary),
    error,
    errorText,
    code: type === 'tool-execute_sql' && typeof input?.sql === 'string' ? input.sql : null,
    // String outputs (the real udata shape) pass through; object outputs stay
    // in `details` only. Kept alongside `code` for the same trace panel.
    output: typeof part.output === 'string' && part.output ? truncateAt(part.output, OUTPUT_TRUNCATE_AT) : null,
    details: buildToolDetails(type, part.input, part.output),
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
