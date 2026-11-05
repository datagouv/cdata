import { describe, expect, it } from 'vitest'
import type { ChartForApi } from '@datagouv/components-next'
import { buildChatBody, buildChatDisplayItems, chartToolResults, isNearChatBottom, mapAssistantError } from '~/utils/assistant'

const CHART = {
  title: 'Population',
  description: '',
  x_axis: { column_x: 'annee', type: 'discrete', sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: null },
  y_axis: { label: null, unit: null, unit_position: null, min: null, max: null },
  series: [{ type: 'line', column_y: 'pop', aggregate_y: 'sum', resource_id: 'r1', column_x_name_override: null, filters: null }],
}

function traceOf(part: Record<string, unknown>) {
  const [item] = buildChatDisplayItems([part])
  return item?.kind === 'trace' ? item.trace : null
}

describe('buildChatBody', () => {
  const messages = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Bonjour' }] }]
  const visualization = CHART as unknown as ChartForApi

  it('includes resource_id when a resource is selected', () => {
    expect(buildChatBody(messages, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', null)).toEqual({
      messages,
      resource_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
  })

  it('omits resource_id when no resource is selected', () => {
    const body = buildChatBody(messages, null, null)
    expect(body).toEqual({ messages })
    expect(body).not.toHaveProperty('resource_id')
    expect(body).not.toHaveProperty('visualization')
  })

  it('sends the visualization with the resource id', () => {
    expect(buildChatBody(messages, 'r1', visualization)).toEqual({ messages, resource_id: 'r1', visualization })
  })

  it('adds the id/trigger/messageId protocol fields when provided', () => {
    expect(buildChatBody(messages, null, null, { id: 'chat-1', trigger: 'submit-message', messageId: undefined }))
      .toEqual({ id: 'chat-1', trigger: 'submit-message', messageId: undefined, messages })
  })
})

describe('chartToolResults', () => {
  it('extracts create and update results in order', () => {
    const results = chartToolResults([
      { id: 'u', role: 'user', parts: [{ type: 'text', text: 'hi' }] },
      {
        id: 'a',
        role: 'assistant',
        parts: [
          { type: 'tool-create_chart', toolCallId: 'c1', state: 'output-available', input: {}, output: { status: 'ok', chart: CHART, more_groups: true } },
          { type: 'tool-query_data', toolCallId: 'q1', state: 'output-available', input: {}, output: 'a | b' },
          { type: 'tool-update_chart', toolCallId: 'c2', state: 'output-available', input: {}, output: { status: 'ok', patch: { title: 'Nouveau' } } },
        ],
      },
    ])

    expect(results).toEqual([
      { toolCallId: 'c1', kind: 'create', chart: CHART, moreGroups: true },
      { toolCallId: 'c2', kind: 'update', patch: { title: 'Nouveau' } },
    ])
  })

  it('defaults moreGroups to false', () => {
    const [result] = chartToolResults([
      { role: 'assistant', parts: [{ type: 'tool-create_chart', toolCallId: 'c1', state: 'output-available', output: { status: 'ok', chart: CHART } }] },
    ])
    expect(result).toMatchObject({ kind: 'create', moreGroups: false })
  })

  it('skips error results and incomplete calls', () => {
    expect(chartToolResults([
      {
        role: 'assistant',
        parts: [
          { type: 'tool-create_chart', toolCallId: 'e', state: 'output-available', output: { status: 'error', errors: ['x'] } },
          { type: 'tool-create_chart', toolCallId: 'i', state: 'input-available', input: {} },
          { type: 'tool-update_chart', toolCallId: 's', state: 'input-streaming' },
          { type: 'tool-update_chart', toolCallId: 'o', state: 'output-error', errorText: 'boom' },
        ],
      },
    ])).toEqual([])
  })

  it('skips malformed outputs and messages', () => {
    expect(chartToolResults([
      null,
      'text',
      { role: 'assistant' },
      { role: 'assistant', parts: [
        { type: 'tool-create_chart', toolCallId: 'a', state: 'output-available', output: { status: 'ok' } },
        { type: 'tool-create_chart', toolCallId: 'b', state: 'output-available', output: { status: 'ok', chart: { series: 'nope' } } },
        { type: 'tool-create_chart', toolCallId: 'c', state: 'output-available', output: 'texte' },
        { type: 'tool-update_chart', toolCallId: 'd', state: 'output-available', output: { status: 'ok', patch: null } },
        { type: 'tool-update_chart', toolCallId: 'e', state: 'output-available', output: { status: 'ok', patch: [] } },
        { type: 'tool-create_chart', state: 'output-available', output: { status: 'ok', chart: CHART } },
      ] },
    ])).toEqual([])
  })
})

describe('buildChatDisplayItems', () => {
  it('keeps alternating tool calls as separate per-call traces in arrival order', () => {
    const items = buildChatDisplayItems([
      { type: 'tool-query_data', state: 'output-available', input: {}, output: 'a\n1' },
      { type: 'tool-inspect_schema', state: 'output-available', input: {}, output: { columns: ['year'], rowCount: 1 } },
      { type: 'tool-create_chart', state: 'output-available', input: {}, output: { status: 'ok', chart: CHART } },
    ])
    const traces = items.map(item => (item.kind === 'trace' ? item.trace.type : null))
    expect(traces).toEqual(['tool-query_data', 'tool-inspect_schema', 'tool-create_chart'])
  })

  it('groups consecutive reasoning parts and keeps text', () => {
    expect(buildChatDisplayItems([
      { type: 'reasoning', text: 'a' },
      { type: 'reasoning', text: 'b' },
      { type: 'text', text: 'Bonjour' },
    ])).toEqual([{ kind: 'thinking', text: 'ab' }, { kind: 'text', text: 'Bonjour' }])
  })

  it('carries a string tool output on the trace and truncates it', () => {
    expect(traceOf({ type: 'tool-query_data', state: 'output-available', output: 'col1 | col2\nval1 | val2' })?.output).toBe('col1 | col2\nval1 | val2')
    const trace = traceOf({ type: 'tool-query_data', state: 'output-available', output: 'x'.repeat(2001) })
    expect(trace?.output).toHaveLength(2001)
    expect(trace?.output?.endsWith('…')).toBe(true)
  })

  it('shows the error text of a failed tool', () => {
    expect(traceOf({ type: 'tool-query_data', state: 'output-error', errorText: 'boom' })).toMatchObject({ error: true, summary: 'boom' })
    expect(traceOf({ type: 'tool-query_data', state: 'output-error' })).toMatchObject({ error: true, summary: 'Échec de l’opération' })
  })
})

describe('summarizes chart tool traces', () => {
  const summaryOf = (part: Record<string, unknown>) => traceOf({ state: 'output-available', input: {}, ...part })?.summary

  it('shows a running summary for an unfinished query', () => {
    expect(summaryOf({ type: 'tool-query_data', state: 'input-streaming' })).toBe('Exécution en cours')
  })

  it.each([
    ['one data row', 'col1 | col2\nval1 | val2', '1 ligne'],
    ['several rows', 'col1 | col2\nval1 | val2\nval3 | val4\nval5 | val6', '3 lignes'],
    ['an empty result', 'Requête exécutée avec succès, aucune ligne retournée.', 'Aucune ligne'],
    ['a header-only table', 'col1 | col2', 'Aucune ligne'],
    ['more groups', 'a | b\n1 | 2\nPlus de 50 groupes : seuls les 50 premiers sont pris en compte.', '1 ligne, plus de 50 valeurs'],
    ['a truncated table', 'a\n1\n2\nRésultat tronqué : 90 lignes au total, 2 premières lignes affichées.', '90 lignes'],
    ['a refusal', 'Requête refusée : la limite de 3 requêtes par question est atteinte.', 'Requête non exécutée'],
    ['an invalid query', 'Requête invalide : groupby demande un agrégat.', 'Requête non exécutée'],
    ['an unknown column', 'Colonne inconnue : foo.', 'Requête non exécutée'],
    ['an unavailable service', 'Le service tabulaire est indisponible.', 'Requête non exécutée'],
    ['no active resource', 'Aucune ressource active : ouvrez une ressource dans le data studio.', 'Requête non exécutée'],
    ['an unknown resource', 'Ressource introuvable : aucune ressource visible ne correspond à cet identifiant.', 'Requête non exécutée'],
    ['a refused action', 'Action refusée : la limite de 5 appels d’outils par tour est atteinte.', 'Requête non exécutée'],
  ])('query_data: %s', (_case, output, summary) => {
    expect(summaryOf({ type: 'tool-query_data', output })).toBe(summary)
  })

  it('query_data falls back to the static summary for a non-string output', () => {
    expect(summaryOf({ type: 'tool-query_data', output: { rowCount: 3 } })).toBe('Je calcule la réponse à partir des données')
  })

  it('create_chart', () => {
    expect(summaryOf({ type: 'tool-create_chart', output: { status: 'ok', chart: CHART } })).toBe('Graphique créé')
    expect(summaryOf({ type: 'tool-create_chart', output: { status: 'error', errors: ['Colonne inconnue : x', 'Autre'] } })).toBe('Colonne inconnue : x ; Autre')
    expect(summaryOf({ type: 'tool-create_chart', state: 'input-available' })).toBe('Je construis le graphique')
  })

  it.each([
    [{ title: 'T' }, 'Titre modifié'],
    [{ title: 'T', y_axis: { unit: '€' } }, 'Titre et unité modifiés'],
    [{ title: 'T', description: 'd', y_axis: { unit: '€' } }, 'Titre, description et unité modifiés'],
    [{ type: 'histogram', y_axis: { label: 'L', min: 0, max: 5 } }, 'Type, libellé de l’axe Y et bornes modifiés'],
    [{ y_axis: { min: 0 } }, 'Bornes modifiées'],
    [{ description: 'd' }, 'Description modifiée'],
    [{ y_axis: { unit: '€' } }, 'Unité modifiée'],
    [{ description: 'd', y_axis: { max: 1 } }, 'Description et bornes modifiées'],
    [{ description: 'd', y_axis: { unit: '€' } }, 'Description et unité modifiées'],
  ])('update_chart %j', (patch, summary) => {
    expect(traceOf({ type: 'tool-update_chart', state: 'output-available', output: { status: 'ok', patch } })?.summary).toBe(summary)
  })

  it('update_chart reports errors', () => {
    expect(summaryOf({ type: 'tool-update_chart', output: { status: 'error', errors: ['Nope'] } })).toBe('Nope')
  })
})

describe('isNearChatBottom', () => {
  function scrolledTo(scrollTop: number, scrollHeight = 1000, clientHeight = 200) {
    return { scrollTop, scrollHeight, clientHeight }
  }

  it('returns true within the threshold and false far from the bottom', () => {
    expect(isNearChatBottom(scrolledTo(720))).toBe(true)
    expect(isNearChatBottom(scrolledTo(800))).toBe(true)
    expect(isNearChatBottom(scrolledTo(0))).toBe(false)
    expect(isNearChatBottom(scrolledTo(700), 100)).toBe(true)
  })
})

describe('mapAssistantError', () => {
  it('maps status codes and falls back', () => {
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 401 }))).toContain('Veuillez vous reconnecter')
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 429 }))).toContain('Quota journalier dépassé')
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 503 }))).toContain('Assistant non configuré')
    expect(mapAssistantError(new TypeError('fetch failed'))).toContain('Une erreur est survenue')
  })
})
