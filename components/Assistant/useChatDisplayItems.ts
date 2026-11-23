import { humanJoin, isRecord, useTranslation } from '@datagouv/components-next'
import type { TranslationFunction } from '@datagouv/components-next'
import { capitalizeFirstLetter } from '~/utils/helpers'

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

type ToolCopy = { label: string, summary: string }

// query_data results carry a plain text table; keep the trace readable
// without letting a huge result bloat the DOM.
const OUTPUT_TRUNCATE_AT = 2000

function truncateAt(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit)}…` : value
}

// Translated when shown: the catalog may still be loading when the composable starts.
type PatchField = { label: (t: TranslationFunction) => string, feminine?: boolean, plural?: boolean, changed: (patch: Record<string, unknown>) => boolean }

const PATCH_FIELDS: PatchField[] = [
  { label: t => t('titre'), changed: patch => 'title' in patch },
  { label: t => t('description'), feminine: true, changed: patch => 'description' in patch },
  { label: t => t('type'), changed: patch => 'type' in patch },
  { label: t => t('libellé de l’axe Y'), changed: patch => isRecord(patch.y_axis) && 'label' in patch.y_axis },
  { label: t => t('unité'), feminine: true, changed: patch => isRecord(patch.y_axis) && 'unit' in patch.y_axis },
  { label: t => t('position de l’unité'), feminine: true, changed: patch => isRecord(patch.y_axis) && 'unit_position' in patch.y_axis },
  { label: t => t('bornes'), feminine: true, plural: true, changed: patch => isRecord(patch.y_axis) && ('min' in patch.y_axis || 'max' in patch.y_axis) },
]

/**
 * Turns a message's parts into display items: text parts pass through,
 * consecutive reasoning parts (AI SDK type 'reasoning') are grouped into one
 * thinking item, and each tool part becomes its own trace — the AI SDK emits
 * one part per tool call (keyed by toolCallId) and mutates its state in place,
 * so no merging is ever needed.
 */
export function useChatDisplayItems() {
  const { t, locale } = useTranslation()

  function toolCopy(type: string): ToolCopy {
    switch (type) {
      case 'tool-query_data':
        return { label: t('Interrogation des données'), summary: t('Je calcule la réponse à partir des données') }
      case 'tool-create_chart':
        return { label: t('Création du graphique'), summary: t('Je construis le graphique') }
      case 'tool-update_chart':
        return { label: t('Modification du graphique'), summary: t('Je modifie le graphique') }
      default:
        return { label: t('Opération'), summary: t('Je poursuis l’analyse') }
    }
  }

  function formatRowCount(count: number): string {
    return t('Aucune ligne | 1 ligne | {rows} lignes', { n: count, rows: count.toLocaleString(locale) })
  }

  // The tool's own errors, shown as udata wrote them for the model: not translated.
  function toolErrors(output: unknown): string | null {
    if (!isRecord(output) || output.status !== 'error') return null
    const errors = Array.isArray(output.errors) ? output.errors.filter((e): e is string => typeof e === 'string') : []
    return errors.length ? errors.join(' ; ') : t('Échec de l’opération')
  }

  // `total` is the exact row count, known only without an aggregate; `rows` is
  // what the table shows.
  // The summaries below are null when the tool's generic one applies.
  function buildQuerySummary(part: Record<string, unknown>): string | null {
    if (part.state !== 'output-available') return t('Exécution en cours')
    const output = part.output
    if (!isRecord(output)) return null
    if (output.status === 'error') return t('Requête non exécutée')
    const count = typeof output.total === 'number' ? output.total : output.rows
    if (output.status !== 'ok' || typeof count !== 'number') return null
    const rows = formatRowCount(count)
    return output.more_groups === true ? t('{rows}, plus de 50 valeurs', { rows }) : rows
  }

  // query_data shows its result table, or its errors when the query was not run.
  // Chart tools' outputs are summarized only.
  function buildToolOutput(type: string, output: unknown): string | null {
    if (type !== 'tool-query_data' || !isRecord(output)) return null
    const text = output.status === 'error' ? toolErrors(output) : output.table
    return typeof text === 'string' && text ? truncateAt(text, OUTPUT_TRUNCATE_AT) : null
  }

  function buildCreateSummary(part: Record<string, unknown>): string | null {
    if (part.state !== 'output-available') return null
    return toolErrors(part.output) ?? t('Graphique créé')
  }

  function buildUpdateSummary(part: Record<string, unknown>): string | null {
    if (part.state !== 'output-available' || !isRecord(part.output)) return null
    const errors = toolErrors(part.output)
    if (errors) return errors
    if (!isRecord(part.output.patch)) return null

    const patch = part.output.patch
    const fields = PATCH_FIELDS.filter(field => field.changed(patch))
    if (fields.length === 0) return null
    const capitalized = capitalizeFirstLetter(humanJoin(fields.map(field => field.label(t))))
    // « modifié » agrees with the selected fields: feminine only when all are.
    const plural = fields.length > 1 || fields[0]!.plural
    const feminine = fields.every(field => field.feminine)
    if (feminine) return plural ? t('{fields} modifiées', { fields: capitalized }) : t('{fields} modifiée', { fields: capitalized })
    return plural ? t('{fields} modifiés', { fields: capitalized }) : t('{fields} modifié', { fields: capitalized })
  }

  function buildSummary(type: string, part: Record<string, unknown>): string | null {
    if (type === 'tool-query_data') return buildQuerySummary(part)
    if (type === 'tool-create_chart') return buildCreateSummary(part)
    if (type === 'tool-update_chart') return buildUpdateSummary(part)
    return null
  }

  function buildToolTrace(type: string, part: Record<string, unknown>): ToolTrace {
    const copy = toolCopy(type)
    const error = part.state === 'output-error'
    const errorText = error
      ? (typeof part.errorText === 'string' && part.errorText ? part.errorText : t('Échec de l’opération'))
      : null

    return {
      label: copy.label,
      summary: errorText ?? buildSummary(type, part) ?? copy.summary,
      error,
      errorText,
      output: buildToolOutput(type, part.output),
    }
  }

  return function buildChatDisplayItems(parts: unknown[]): ChatDisplayItem[] {
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
}
