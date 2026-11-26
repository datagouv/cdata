import { humanJoin, isRecord, useTranslation } from '@datagouv/components-next'
import type { TranslationFunction } from '@datagouv/components-next'
import { capitalizeFirstLetter } from '~/utils/helpers'
import { displayedToolCalls, messageTexts, queryRowCount, toolCalls, type ToolCall } from './toolCalls'
import { useTurnReasoning } from './useTurnReasoning'

export type ToolTrace = {
  label: string
  summary: string
  error: boolean
  errorText: string | null
  output: string | null
}

export type ChatMessageDisplay = {
  textsAbove: string[]
  textsBelow: string[]
  traces: ToolTrace[]
  toolsRunning: boolean
  reasoning: string[]
}

// Label and generic summary are translated when shown; buildSummary returns null when the generic one applies.
type ToolDisplay = {
  label: () => string
  summary: () => string
  buildSummary?: (part: Record<string, unknown>) => string | null
  buildOutput?: (output: unknown) => string | null
}

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

export function useMessageDisplay() {
  const { t, locale } = useTranslation()
  const buildReasoning = useTurnReasoning()

  function formatRowCount(count: number): string {
    return t('Aucune ligne | 1 ligne | {rows} lignes', { n: count, rows: count.toLocaleString(locale) })
  }

  // The tool's own errors, shown as udata wrote them for the model: not translated.
  function toolErrors(output: unknown): string | null {
    if (!isRecord(output) || output.status !== 'error') return null
    const errors = Array.isArray(output.errors) ? output.errors.filter((e): e is string => typeof e === 'string') : []
    return errors.length ? errors.join(' ; ') : t('Échec de l’opération')
  }

  function buildQuerySummary(part: Record<string, unknown>): string | null {
    if (part.state !== 'output-available') return t('Exécution en cours')
    const output = part.output
    if (!isRecord(output)) return null
    if (output.status === 'error') return t('Requête non exécutée')
    const count = queryRowCount(output)
    if (output.status !== 'ok' || count === null) return null
    const rows = formatRowCount(count)
    return output.more_groups === true ? t('{rows}, plus de 50 valeurs', { rows }) : rows
  }

  // The result table, or the errors when the query was not run.
  function buildQueryOutput(output: unknown): string | null {
    if (!isRecord(output)) return null
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

  // One entry per udata tool. Chart tools' outputs are summarized only.
  const tools: Record<string, ToolDisplay> = {
    'tool-query_data': {
      label: () => t('Interrogation des données'),
      summary: () => t('Je calcule la réponse à partir des données'),
      buildSummary: buildQuerySummary,
      buildOutput: buildQueryOutput,
    },
    'tool-create_chart': {
      label: () => t('Création du graphique'),
      summary: () => t('Je construis le graphique'),
      buildSummary: buildCreateSummary,
    },
    'tool-update_chart': {
      label: () => t('Modification du graphique'),
      summary: () => t('Je modifie le graphique'),
      buildSummary: buildUpdateSummary,
    },
  }
  const otherTool: ToolDisplay = {
    label: () => t('Opération'),
    summary: () => t('Je poursuis l’analyse'),
  }

  function buildToolTrace({ type, part, status }: ToolCall): ToolTrace {
    const tool = tools[type] ?? otherTool
    // A tool refusal is a failure too, but its summary already carries the errors: only the SDK's own error has an errorText.
    const error = status === 'failed'
    const errorText = part.state === 'output-error'
      ? (typeof part.errorText === 'string' && part.errorText ? part.errorText : t('Échec de l’opération'))
      : null

    return {
      label: tool.label(),
      summary: errorText ?? tool.buildSummary?.(part) ?? tool.summary(),
      error,
      errorText,
      output: tool.buildOutput?.(part.output) ?? null,
    }
  }

  // The AI SDK 'reasoning' parts, the model's own reasoning, are never read: the reasoning block is built from the tool calls.
  return function buildMessageDisplay(parts: unknown[]): ChatMessageDisplay {
    const calls = displayedToolCalls(toolCalls(parts))
    const { planTexts, answerTexts } = messageTexts(parts)
    return {
      // Until a tool call arrives, a text may yet turn out to be the plan: kept above so it does not jump.
      textsAbove: calls.length ? planTexts : answerTexts,
      textsBelow: calls.length ? answerTexts : [],
      // The AI SDK emits one part per tool call and updates it in place: no merging is needed.
      traces: calls.map(buildToolTrace),
      toolsRunning: calls.some(call => call.status === 'running'),
      reasoning: buildReasoning(parts),
    }
  }
}
