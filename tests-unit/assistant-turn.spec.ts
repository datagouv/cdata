import { describe, expect, it } from 'vitest'
import { displayedToolCalls, hasAnswerText, toolCalls } from '~/components/Assistant/toolCalls'
import { useTurnReasoning } from '~/components/Assistant/useTurnReasoning'
import { useTurnTimeline } from '~/components/Assistant/useTurnTimeline'

const buildTimeline = useTurnTimeline()
const buildReasoning = useTurnReasoning()
const OK_QUERY = { status: 'ok', table: 'a\n1', rows: 1, total: 1, more_groups: false }
const REFUSED = { status: 'error', errors: ['Unknown column: x.'] }
const BUDGET_REFUSED = { status: 'error', errors: ['Action refused: the limit of 5 tool calls per turn is reached.'] }
const tool = (name: string, state: string, output?: unknown, input: unknown = {}) =>
  ({ type: `tool-${name}`, toolCallId: `${name}-${Math.random()}`, state, input, output })
const text = (value: string) => ({ type: 'text', text: value })
const PLANNING = { title: 'Analyse en cours', steps: [{ label: 'Planification de la réponse…', status: 'active' }] }

describe('useTurnTimeline', () => {
  it('plans the answer before any tool call or text', () => {
    expect(buildTimeline([])).toEqual(PLANNING)
    expect(buildTimeline([{ type: 'step-start' }, { type: 'reasoning', text: 'The user wants' }])).toEqual(PLANNING)
  })

  it('shows a running query as the active step', () => {
    expect(buildTimeline([tool('query_data', 'input-streaming')])).toEqual({
      title: 'Analyse en cours',
      steps: [{ label: 'Je calcule la réponse à partir des données', status: 'active' }],
    })
  })

  it('interprets the results once every tool is done, before any text', () => {
    expect(buildTimeline([tool('query_data', 'output-available', OK_QUERY)])).toEqual({
      title: 'Analyse des résultats',
      steps: [
        { label: 'Calcul effectué sur les données', status: 'complete' },
        { label: 'J’interprète les résultats obtenus', status: 'active' },
      ],
    })
  })

  it('writes the answer once text follows the tools', () => {
    const timeline = buildTimeline([tool('query_data', 'output-available', OK_QUERY), text('Voici')])
    expect(timeline.title).toBe('Réponse en cours')
    expect(timeline.steps.at(-1)).toEqual({ label: 'Je rédige la réponse', status: 'active' })
  })

  it('does not take a text written before the tools for the answer', () => {
    const timeline = buildTimeline([text('Je vais vérifier les données.'), tool('query_data', 'output-available', OK_QUERY)])
    expect(timeline.title).toBe('Analyse des résultats')
    expect(timeline.steps.at(-1)!.label).toBe('J’interprète les résultats obtenus')
  })

  it('answers without tools', () => {
    expect(buildTimeline([text('Bonjour')])).toEqual({
      title: 'Réponse en cours',
      steps: [{ label: 'Je rédige la réponse', status: 'active' }],
    })
  })

  it.each([
    ['create_chart', 'Je prépare le graphique à partir des résultats', 'Graphique préparé'],
    ['update_chart', 'J’applique les modifications au graphique', 'Graphique modifié'],
    ['other', 'Je poursuis l’analyse', 'Étape terminée'],
  ])('labels %s while it runs and once done', (name, running, done) => {
    expect(buildTimeline([tool(name, 'input-available')]).steps[0]!.label).toBe(running)
    expect(buildTimeline([tool(name, 'output-available', { status: 'ok' })]).steps[0]!.label).toBe(done)
  })

  it.each([
    ['a refused query', tool('query_data', 'output-available', REFUSED)],
    ['a failed query', tool('query_data', 'output-error')],
  ])('shows %s awaiting its correction as a step to correct, never as an error', (_case, failed) => {
    expect(buildTimeline([failed, tool('query_data', 'input-streaming')]).steps).toEqual([
      { label: 'Le premier calcul doit être corrigé avant de poursuivre', status: 'complete' },
      { label: 'Je calcule la réponse à partir des données', status: 'active' },
    ])
  })

  it('drops a failed call once the same tool succeeds', () => {
    expect(buildTimeline([tool('query_data', 'output-available', REFUSED), tool('query_data', 'output-available', OK_QUERY)]).steps).toEqual([
      { label: 'Calcul effectué sur les données', status: 'complete' },
      { label: 'J’interprète les résultats obtenus', status: 'active' },
    ])
  })

  it('counts a refused step budget as a failure', () => {
    expect(buildTimeline([tool('create_chart', 'output-available', BUDGET_REFUSED)]).steps[0]).toEqual(
      { label: 'Une étape doit être ajustée avant de poursuivre', status: 'complete' },
    )
  })

  it('keeps parallel running calls active', () => {
    expect(buildTimeline([tool('query_data', 'input-available'), tool('query_data', 'input-streaming')])).toEqual({
      title: 'Analyse en cours',
      steps: [
        { label: 'Je calcule la réponse à partir des données', status: 'active' },
        { label: 'Je calcule la réponse à partir des données', status: 'active' },
      ],
    })
  })
})

describe('toolCalls', () => {
  it('classifies the tool parts in order and ignores the others', () => {
    const calls = toolCalls([
      text('Bonjour'),
      null,
      tool('a', 'input-streaming'),
      tool('b', 'approval-requested'),
      tool('c', 'output-available', OK_QUERY),
      tool('d', 'output-available', REFUSED),
      tool('e', 'output-error'),
      tool('f', 'output-denied'),
      { type: 'tool-g' },
    ])
    expect(calls.map(call => [call.type, call.status])).toEqual([
      ['tool-a', 'running'],
      ['tool-b', 'running'],
      ['tool-c', 'succeeded'],
      ['tool-d', 'failed'],
      ['tool-e', 'failed'],
      ['tool-f', 'failed'],
      ['tool-g', 'running'],
    ])
  })

  it('keeps a failed call when only another tool succeeds after it', () => {
    const calls = toolCalls([tool('query_data', 'output-error'), tool('create_chart', 'output-available', { status: 'ok' })])
    expect(displayedToolCalls(calls)).toEqual(calls)
  })

  it('takes only a non-blank text after the last tool for the answer', () => {
    expect(hasAnswerText([tool('query_data', 'output-available', OK_QUERY), text('  \n')])).toBe(false)
    expect(hasAnswerText([text('Avant'), tool('query_data', 'output-available', OK_QUERY)])).toBe(false)
    expect(hasAnswerText([text('Avant'), tool('query_data', 'output-available', OK_QUERY), text('Après')])).toBe(true)
    expect(hasAnswerText([{ type: 'step-start' }])).toBe(false)
  })
})

const query = (output: unknown, purpose?: unknown) => tool('query_data', 'output-available', output, purpose === undefined ? {} : { purpose })
const chart = (type: string, description = 'Logements par région') =>
  tool('create_chart', 'output-available', { status: 'ok', chart: { description, series: [{ type }] }, more_groups: false })
const update = (patch: Record<string, unknown>) => tool('update_chart', 'output-available', { status: 'ok', patch })
const rows = (count: number) => ({ ...OK_QUERY, rows: count, total: count })

describe('useTurnReasoning', () => {
  it('says nothing without a finished tool call', () => {
    expect(buildReasoning([text('Bonjour')])).toEqual([])
    expect(buildReasoning([tool('query_data', 'input-available')])).toEqual([])
  })

  it('orders the sentences: intent, queries, chart', () => {
    expect(buildReasoning([query(rows(3), 'Compter les logements par région'), chart('histogram')])).toEqual([
      'J’ai compris votre demande ainsi : Logements par région.',
      'J’ai interrogé les données nécessaires à la réponse. Le résultat retenu contient 3 lignes.',
      'J’ai choisi un histogramme pour rendre ces résultats plus faciles à comparer.',
    ])
  })

  it('takes the intent from the last query purpose without a chart, without doubling its final stop', () => {
    expect(buildReasoning([query(rows(1), 'Premier essai'), query(rows(1), 'Compter les logements par région.')])[0])
      .toBe('J’ai compris votre demande ainsi : Compter les logements par région.')
  })

  it('drops the space French puts before a final question mark', () => {
    expect(buildReasoning([query(rows(1), 'Combien de logements par région ?')])[0])
      .toBe('J’ai compris votre demande ainsi : Combien de logements par région.')
  })

  it('falls back to the last query purpose when the chart description is unusable', () => {
    expect(buildReasoning([query(rows(1), 'Compter'), chart('line', '  ')])[0]).toBe('J’ai compris votre demande ainsi : Compter.')
  })

  it('leaves the intent to the successful query purpose when the chart failed', () => {
    expect(buildReasoning([query(rows(1), 'Compter'), tool('create_chart', 'output-available', REFUSED)])).toEqual([
      'J’ai compris votre demande ainsi : Compter.',
      'J’ai interrogé les données nécessaires à la réponse. Le résultat retenu contient 1 ligne.',
    ])
  })

  it.each([undefined, '', '   ', 42, null])('never guesses the intent (purpose %j)', (purpose) => {
    expect(buildReasoning([query(rows(1), purpose)]).some(sentence => sentence.startsWith('J’ai compris'))).toBe(false)
  })

  it.each([
    ['no row', rows(0), 'Le résultat retenu ne contient aucune ligne.'],
    ['one row', rows(1), 'Le résultat retenu contient 1 ligne.'],
    ['the rows shown of an aggregate', { ...OK_QUERY, rows: 7, total: null }, 'Le résultat retenu contient 7 lignes.'],
    ['the rows returned, not the rows of the filtered resource', { ...OK_QUERY, rows: 5, total: 18 }, 'Le résultat retenu contient 5 lignes.'],
    ['more than 50 groups', { ...OK_QUERY, rows: 50, total: null, more_groups: true }, 'Le résultat retenu compte plus de 50 valeurs ; seules les 50 premières ont été lues.'],
  ])('gives the row count of %s', (_case, output, sentence) => {
    expect(buildReasoning([query(output)])).toEqual([`J’ai interrogé les données nécessaires à la réponse. ${sentence}`])
  })

  it('counts only the successful queries', () => {
    expect(buildReasoning([query(REFUSED), query(rows(1)), query(rows(1))])).toEqual([
      'J’ai effectué 2 calculs pour vérifier ou corriger le résultat. Le résultat retenu contient 1 ligne.',
    ])
  })

  it.each([
    ['line', 'J’ai choisi un graphique en courbes pour rendre ces résultats plus faciles à comparer.'],
    ['histogram', 'J’ai choisi un histogramme pour rendre ces résultats plus faciles à comparer.'],
    ['pie', 'J’ai choisi un graphique pour rendre ces résultats plus faciles à comparer.'],
  ])('names the %s chart type', (type, sentence) => {
    expect(buildReasoning([chart(type)]).at(-1)).toBe(sentence)
  })

  it('says once that the chart was updated without recomputing its data', () => {
    const sentence = 'J’ai appliqué les modifications demandées au graphique existant sans recalculer ses données.'
    expect(buildReasoning([update({ title: 'T', y_axis: { unit: '€' } })])).toEqual([sentence])
    expect(buildReasoning([update({ title: 'T' }), update({ description: 'd' })])).toEqual([sentence])
  })

  it('leaves out the failed calls', () => {
    expect(buildReasoning([tool('create_chart', 'output-available', REFUSED)])).toEqual([])
    expect(buildReasoning([tool('create_chart', 'output-error')])).toEqual([])
    expect(buildReasoning([tool('query_data', 'output-available', REFUSED, { purpose: 'Compter' })])).toEqual([])
  })
})
