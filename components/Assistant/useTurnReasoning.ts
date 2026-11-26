import { isRecord, useTranslation } from '@datagouv/components-next'
import { displayedToolCalls, queryRowCount, toolCalls } from './toolCalls'
import type { ToolCall } from './toolCalls'

// A blank or non-string value is no intent: the sentence is left out rather than guessed.
function cleanIntent(value: unknown): string | null {
  if (typeof value !== 'string') return null
  // The second trim drops the space French puts before « ? » and « ! ».
  const intent = value.trim().replace(/[.!?…]+$/, '').trim()
  return intent === '' ? null : intent
}

export function useTurnReasoning() {
  const { t, locale } = useTranslation()

  function rowsSentence(call: ToolCall): string {
    if (!isRecord(call.output) || call.output.status !== 'ok') return ''
    if (call.output.more_groups === true) return t('Le résultat retenu compte plus de 50 valeurs ; seules les 50 premières ont été lues.')
    const count = queryRowCount(call.output)
    if (count === null) return ''
    return t('Le résultat retenu ne contient aucune ligne. | Le résultat retenu contient 1 ligne. | Le résultat retenu contient {rows} lignes.', { n: count, rows: count.toLocaleString(locale) })
  }

  function chartSentence(call: ToolCall): string {
    const series = isRecord(call.output) && isRecord(call.output.chart) ? call.output.chart.series : null
    const first = Array.isArray(series) ? series[0] : null
    const type = isRecord(first) ? first.type : null
    if (type === 'line') return t('J’ai choisi un graphique en courbes pour rendre ces résultats plus faciles à comparer.')
    if (type === 'histogram') return t('J’ai choisi un histogramme pour rendre ces résultats plus faciles à comparer.')
    return t('J’ai choisi un graphique pour rendre ces résultats plus faciles à comparer.')
  }

  function chartIntent(call: ToolCall | undefined): string | null {
    return call && isRecord(call.output) && isRecord(call.output.chart) ? cleanIntent(call.output.chart.description) : null
  }

  function queryIntent(call: ToolCall | undefined): string | null {
    return call && isRecord(call.input) ? cleanIntent(call.input.purpose) : null
  }

  return function buildReasoning(parts: unknown[]): string[] {
    const succeeded = displayedToolCalls(toolCalls(parts)).filter(call => call.status === 'succeeded')
    const queries = succeeded.filter(call => call.type === 'tool-query_data')
    const charts = succeeded.filter(call => call.type === 'tool-create_chart')
    const intent = chartIntent(charts.at(-1)) ?? queryIntent(queries.at(-1))

    const sentences: string[] = []
    if (intent) sentences.push(t('J’ai compris votre demande ainsi : {intent}.', { intent }))
    if (queries.length) {
      const opening = queries.length === 1
        ? t('J’ai interrogé les données nécessaires à la réponse.')
        : t('J’ai effectué {count} calculs pour vérifier ou corriger le résultat.', { count: queries.length })
      sentences.push([opening, rowsSentence(queries.at(-1)!)].filter(Boolean).join(' '))
    }
    if (charts.length) sentences.push(chartSentence(charts.at(-1)!))
    if (succeeded.some(call => call.type === 'tool-update_chart')) {
      sentences.push(t('J’ai appliqué les modifications demandées au graphique existant sans recalculer ses données.'))
    }
    return sentences
  }
}
