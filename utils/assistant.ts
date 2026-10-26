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
 * Build the assistant chat request body. The optional `resource_id` context
 * is only sent when a resource is selected.
 */
export function buildChatBody(messages: unknown[], resourceId: string | null): { messages: unknown[], resource_id?: string } {
  return {
    messages,
    ...(resourceId ? { resource_id: resourceId } : {}),
  }
}

/**
 * Map an error surfaced by useChat to a French user-facing message.
 * HTTP failures carry a `statusCode` (APICallError from the transport);
 * anything else is treated as a network/unknown failure.
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
  details: ToolTraceDetail[]
  count: number
}

export type ChatDisplayItem
  = | { kind: 'text', text: string }
    | { kind: 'trace', trace: ToolTrace }

// French labels, used as i18n keys by the component ($t returns the key).
const TOOL_LABELS: Record<string, { label: string, summary: string }> = {
  'tool-get_dataset_metadata': { label: 'Lecture des métadonnées', summary: 'Je consulte la fiche du jeu de données' },
  'tool-inspect_schema': { label: 'Inspection du schéma', summary: 'Je vérifie les colonnes et les types disponibles' },
  'tool-execute_sql': { label: 'Exécution de la requête SQL', summary: 'Je calcule la réponse à partir des données' },
  'tool-request_clarification': { label: 'Demande de clarification', summary: 'Je précise ce qui est ambigu' },
}

const FALLBACK_TOOL_LABEL = { label: 'Opération', summary: 'Je poursuis l’analyse' }
const DETAIL_TRUNCATE_AT = 200
const FLATTENED_DETAIL_LIMIT = 8

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function truncateValue(value: string): string {
  return value.length > DETAIL_TRUNCATE_AT ? `${value.slice(0, DETAIL_TRUNCATE_AT)}…` : value
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
    ? (typeof part.errorText === 'string' && part.errorText ? part.errorText : 'Échec de l’opération')
    : null
  const input = isRecord(part.input) ? part.input : undefined

  return {
    type,
    state,
    label: labels.label,
    summary: error ? errorText! : labels.summary,
    error,
    errorText,
    code: type === 'tool-execute_sql' && typeof input?.sql === 'string' ? input.sql : null,
    details: buildToolDetails(type, part.input, part.output),
    count: 1,
  }
}

/**
 * Turn a message's parts into display items: text parts pass through and
 * consecutive tool parts of the same type and state are grouped into a single
 * tool trace (with a counter), per the validated prototype design.
 */
export function buildChatDisplayItems(parts: unknown[]): ChatDisplayItem[] {
  const items: ChatDisplayItem[] = []

  for (const part of parts) {
    if (!isRecord(part) || typeof part.type !== 'string') continue

    if (part.type === 'text') {
      if (typeof part.text === 'string' && part.text) items.push({ kind: 'text', text: part.text })
      continue
    }
    if (!part.type.startsWith('tool-')) continue

    const last = items[items.length - 1]
    if (last?.kind === 'trace' && last.trace.type === part.type && last.trace.state === (typeof part.state === 'string' ? part.state : '')) {
      last.trace.count += 1
      continue
    }
    items.push({ kind: 'trace', trace: buildToolTrace(part.type, part) })
  }

  return items
}
