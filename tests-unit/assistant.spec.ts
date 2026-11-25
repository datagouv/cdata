// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTranslation } from '@datagouv/components-next'
import type { ChartForApi, ColumnDefinition } from '@datagouv/components-next'
import ChatPanel from '~/components/Assistant/ChatPanel.vue'
import AssistantSpinner from '~/components/Assistant/AssistantSpinner.vue'
import ToolTrace from '~/components/Assistant/ToolTrace.vue'
import AssistantTimeline from '~/components/Assistant/AssistantTimeline.vue'
import ReasoningBlock from '~/components/Assistant/ReasoningBlock.vue'
import ToolsBlock from '~/components/Assistant/ToolsBlock.vue'
import { chartToolResults, isNearChatBottom, toAssistantVisualization } from '~/utils/assistant'
import { useAssistantErrorMessage } from '~/components/Assistant/useAssistantErrorMessage'
import { useChatDisplayItems, type ToolTrace as ToolTraceModel } from '~/components/Assistant/useChatDisplayItems'
import { useStarterQuestions } from '~/components/Assistant/useStarterQuestions'
import type { AssistantVisualization } from '~/utils/assistant'

const { locale } = useTranslation()

const sendMessageMock = vi.hoisted(() => vi.fn())
const stopMock = vi.hoisted(() => vi.fn())
const newConversationMock = vi.hoisted(() => vi.fn())

// The real builder, spied on to check which messages are rebuilt on each chunk.
const buildSpy = vi.hoisted(() => vi.fn())
vi.mock('~/components/Assistant/useChatDisplayItems', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/components/Assistant/useChatDisplayItems')>()
  return {
    ...actual,
    useChatDisplayItems: () => {
      buildSpy.mockImplementation(actual.useChatDisplayItems())
      return buildSpy
    },
  }
})

const buildChatDisplayItems = useChatDisplayItems()
const starterQuestions = (columns: Array<ColumnDefinition>) => useStarterQuestions(columns).value

// State shared with the mocked useAssistantChat. The mock factory (which runs
// after imports) fills it with real Vue refs; tests set state before mounting.
const chatState = vi.hoisted(() => ({} as {
  messages: import('vue').Ref<Array<{ id: string, role: string, parts: Array<Record<string, unknown>> }>>
  status: import('vue').Ref<string>
  error: import('vue').Ref<unknown>
}))

vi.mock('~/components/Assistant/useAssistantChat', async () => {
  const { ref, shallowRef } = await import('vue')
  // useChat publishes a new array, and a new object for each changed message.
  chatState.messages = shallowRef([])
  chatState.status = ref('ready')
  chatState.error = ref(null)
  return {
    useAssistantChat: () => ({ ...chatState, sendMessage: sendMessageMock, stop: stopMock, newConversation: newConversationMock }),
  }
})

function assistantTextMessage(text: string) {
  return {
    id: `msg-${Math.random().toString(36).slice(2)}`,
    role: 'assistant',
    parts: [{ type: 'text', text }],
  }
}

type PanelResource = { title: string, format: string | null }

const GUIDE_URL = 'https://guides.example/assistant-mistakes'

function mountPanel(
  resourceId: string | null,
  visualization: AssistantVisualization | null = null,
  { columns = [], resource = resourceId ? { title: 'Table parquet A', format: 'parquet' } : null }: { columns?: Array<ColumnDefinition>, resource?: PanelResource | null } = {},
) {
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { guidesAssistantMistakes: GUIDE_URL } }))
  return mount(ChatPanel, {
    props: { resourceId, visualization, columns, resource },
    attachTo: document.body,
    global: {
      mocks: { $t: (key: string) => key },
    },
  })
}

const CHART = {
  title: 'Population',
  description: '',
  x_axis: { column_x: 'annee', type: 'discrete', sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: null },
  y_axis: { label: null, unit: null, unit_position: null, min: null, max: null },
  series: [{ type: 'line', column_y: 'pop', aggregate_y: 'sum', resource_id: 'r1', column_x_name_override: null, filters: null }],
}

function traceOf(part: Record<string, unknown>) {
  return buildChatDisplayItems([part]).traces[0] ?? null
}

describe('toAssistantVisualization', () => {
  const filter = { _cls: 'Filter', column: 'reg', condition: 'exact', value: '11' } as const
  const chart = {
    ...CHART,
    private: true,
    extras: { secret: 1 },
    owner: 'u1',
    organization: null,
    series: [{ ...CHART.series[0], filters: filter }],
  } as unknown as ChartForApi

  it('keeps only what the assistant needs', () => {
    expect(toAssistantVisualization(chart, true)).toEqual({
      exists: true,
      title: 'Population',
      description: '',
      x_axis: CHART.x_axis,
      y_axis: CHART.y_axis,
      series: [{ type: 'line', column_y: 'pop', aggregate_y: 'sum', resource_id: 'r1', filters: filter }],
    })
  })

  it('tells a new chart from a saved one', () => {
    expect(toAssistantVisualization(chart, false)).toMatchObject({ exists: false })
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
          { type: 'tool-query_data', toolCallId: 'q1', state: 'output-available', input: {}, output: { status: 'ok', table: '', rows: 0, total: 0, more_groups: false } },
          { type: 'tool-update_chart', toolCallId: 'c2', state: 'output-available', input: {}, output: { status: 'ok', patch: { title: 'Nouveau' } } },
        ],
      },
    ])

    expect(results).toEqual([
      { toolCallId: 'c1', kind: 'create', chart: CHART },
      { toolCallId: 'c2', kind: 'update', patch: { title: 'Nouveau' } },
    ])
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

  // The chart is turned into form fields right away: a missing axis must not throw there.
  it.each([
    ['no x axis', { ...CHART, x_axis: undefined }],
    ['an x axis array', { ...CHART, x_axis: [] }],
    ['no y axis', { ...CHART, y_axis: null }],
    ['a y axis array', { ...CHART, y_axis: [] }],
    ['a series that is not an object', { ...CHART, series: [null] }],
    ['a series array entry', { ...CHART, series: [[]] }],
    ['a chart array', [CHART]],
  ])('skips a created chart with %s', (_case, chart) => {
    expect(chartToolResults([
      { role: 'assistant', parts: [{ type: 'tool-create_chart', toolCallId: 'c1', state: 'output-available', output: { status: 'ok', chart } }] },
    ])).toEqual([])
  })
})

describe('useChatDisplayItems', () => {
  it('keeps the text parts and drops the raw reasoning', () => {
    const display = buildChatDisplayItems([
      { type: 'reasoning', text: 'The user wants a chart' },
      { type: 'text', text: 'Bonjour' },
      { type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'ok', table: 'n\n1', rows: 1, total: 1, more_groups: false } },
      { type: 'text', text: 'Voici' },
    ])
    expect(display.texts).toEqual(['Bonjour', 'Voici'])
    expect(JSON.stringify(display)).not.toContain('The user wants')
  })

  it('flags a tool refusal as an error, without an error text', () => {
    expect(traceOf({ type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'error', errors: ['Unknown column: x.'] } }))
      .toMatchObject({ error: true, errorText: null, summary: 'Requête non exécutée', output: 'Unknown column: x.' })
  })

  it('hides a failed call once the same tool succeeds, but not while its retry runs', () => {
    const refused = { type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'error', errors: ['Unknown column: x.'] } }
    const ok = { type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'ok', table: 'n\n1', rows: 1, total: 1, more_groups: false } }
    expect(buildChatDisplayItems([refused, ok]).traces).toHaveLength(1)

    const retrying = buildChatDisplayItems([{ type: 'tool-query_data', state: 'output-error', input: {}, errorText: 'boom' }, { type: 'tool-query_data', state: 'input-streaming' }]).traces
    expect(retrying).toHaveLength(2)
    expect(retrying[0]!.error).toBe(true)

    const otherTool = buildChatDisplayItems([{ type: 'tool-query_data', state: 'output-error', input: {}, errorText: 'boom' }, { type: 'tool-create_chart', state: 'output-available', input: {}, output: { status: 'ok', chart: CHART } }]).traces
    expect(otherTool).toHaveLength(2)
  })

  it('carries the query_data table on the trace and truncates it', () => {
    const query = (table: string) => traceOf({ type: 'tool-query_data', state: 'output-available', output: { status: 'ok', table, rows: 1, total: 1, more_groups: false } })
    expect(query('col1 | col2\nval1 | val2')?.output).toBe('col1 | col2\nval1 | val2')
    const trace = query('x'.repeat(2001))
    expect(trace?.output).toHaveLength(2001)
    expect(trace?.output?.endsWith('…')).toBe(true)
  })

  it('carries the query_data errors on the trace', () => {
    expect(traceOf({ type: 'tool-query_data', state: 'output-available', output: { status: 'error', errors: ['Unknown column: x.', 'Other.'] } })?.output)
      .toBe('Unknown column: x. ; Other.')
  })

  it('only carries the query_data output', () => {
    expect(traceOf({ type: 'tool-other', state: 'output-available', output: 'year: int' })?.output).toBeNull()
    expect(traceOf({ type: 'tool-create_chart', state: 'output-available', output: { status: 'error', errors: ['x'] } })?.output).toBeNull()
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
    ['one row', { status: 'ok', table: 'a\n1', rows: 1, total: 1, more_groups: false }, '1 ligne'],
    ['several rows', { status: 'ok', table: 'a\n1\n2\n3', rows: 3, total: 3, more_groups: false }, '3 lignes'],
    // Formatted in the locale: happy-dom's navigator is en-US.
    ['a truncated table', { status: 'ok', table: 'a\n1\n2', rows: 2, total: 2187, more_groups: false }, '2,187 lignes'],
    ['an aggregate with more groups', { status: 'ok', table: 'a | b\n1 | 2', rows: 50, total: null, more_groups: true }, '50 lignes, plus de 50 valeurs'],
    ['an empty result', { status: 'ok', table: '', rows: 0, total: 0, more_groups: false }, 'Aucune ligne'],
    ['an error', { status: 'error', errors: ['Unknown column: x.'] }, 'Requête non exécutée'],
  ])('query_data: %s', (_case, output, summary) => {
    expect(summaryOf({ type: 'tool-query_data', output })).toBe(summary)
  })

  it.each([
    ['a text output', 'a | b'],
    ['no row count', { status: 'ok', table: 'a' }],
    ['a string row count', { status: 'ok', table: 'a', rows: '3', total: null }],
    ['an unknown status', { status: 'pending', rows: 3 }],
  ])('query_data falls back to the static summary for %s', (_case, output) => {
    expect(summaryOf({ type: 'tool-query_data', output })).toBe('Je calcule la réponse à partir des données')
  })

  it('create_chart', () => {
    expect(summaryOf({ type: 'tool-create_chart', output: { status: 'ok', chart: CHART } })).toBe('Graphique créé')
    expect(summaryOf({ type: 'tool-create_chart', output: { status: 'error', errors: ['Colonne inconnue : x', 'Autre'] } })).toBe('Colonne inconnue : x ; Autre')
    expect(summaryOf({ type: 'tool-create_chart', state: 'input-available' })).toBe('Je construis le graphique')
  })

  // The French keys, as no catalog is loaded in tests.
  it.each([
    [{ title: 'T' }, 'Titre modifié'],
    [{ title: 'T', y_axis: { unit: '€' } }, 'Titre et unité modifiés'],
    [{ title: 'T', description: 'd', y_axis: { unit: '€' } }, 'Titre, description et unité modifiés'],
    [{ type: 'histogram', y_axis: { label: 'L', min: 0, max: 5 } }, 'Type, libellé de l’axe Y et bornes modifiés'],
    [{ y_axis: { min: 0 } }, 'Bornes modifiées'],
    [{ description: 'd' }, 'Description modifiée'],
    [{ y_axis: { unit: '€' } }, 'Unité modifiée'],
    [{ y_axis: { unit_position: 'prefix' } }, 'Position de l’unité modifiée'],
    [{ description: 'd', y_axis: { max: 1 } }, 'Description et bornes modifiées'],
    [{ description: 'd', y_axis: { unit: '€' } }, 'Description et unité modifiées'],
  ])('update_chart %j', (patch, summary) => {
    expect(traceOf({ type: 'tool-update_chart', state: 'output-available', output: { status: 'ok', patch } })?.summary).toBe(summary)
  })

  it('update_chart reports errors', () => {
    expect(summaryOf({ type: 'tool-update_chart', output: { status: 'error', errors: ['Nope'] } })).toBe('Nope')
  })
})

describe('useStarterQuestions', () => {
  const OPENER = 'Quel graphique peut-on faire avec ces données ?'

  it('suggests charts crossing the first useful dimension and measure', () => {
    const questions = starterQuestions([
      { name: '__id', type: 'number' },
      { name: 'departement', type: 'categorical' },
      { name: 'population', type: 'number' },
    ])

    expect(questions).toEqual([
      OPENER,
      'Fais un histogramme de la somme de « population » par « departement »',
      'Compte les lignes par « departement »',
      'Montre la moyenne de « population » par « departement »',
    ])
  })

  // buildColumnsFromProfile types a year column as a number.
  it('skips identifier, code, year and free-text columns', () => {
    const questions = starterQuestions([
      { name: 'code_insee', type: 'number' },
      { name: 'annee', type: 'number' },
      { name: 'url', type: 'text' },
      { name: 'region_id', type: 'categorical' },
      { name: 'date', type: 'date' },
    ])

    expect(questions).toEqual([
      OPENER,
      'Trace l’évolution du nombre de lignes selon « date »',
      'Propose-moi un graphique pertinent pour cette ressource',
    ])
  })

  it('suggests charts on the vote counts of « Table parquet A », not on its reference or free-text title', () => {
    // Column names and types as api-tabular profiles that parquet resource.
    const questions = starterQuestions([
      { name: 'id', type: 'text' },
      { name: 'url', type: 'text' },
      { name: 'date', type: 'date' },
      { name: 'pour', type: 'number' },
      { name: 'title', type: 'text' },
      { name: 'contre', type: 'number' },
      { name: 'votants', type: 'number' },
      { name: 'dossier_ref', type: 'number' },
      { name: 'suffrages_exprimes', type: 'number' },
    ])

    expect(questions).toEqual([
      OPENER,
      'Trace l’évolution de « pour » selon « date »',
      'Propose-moi un graphique pertinent pour cette ressource',
    ])
  })

  it('skips reference and number identifiers as measures, but not measures sharing their letters', () => {
    for (const name of ['dossier_ref', 'ref_dossier', 'reference', 'num_dossier', 'numero', 'numéro_ligne']) {
      const questions = starterQuestions([{ name, type: 'number' }, { name: 'date', type: 'date' }])
      expect(questions, name).toContain('Trace l’évolution du nombre de lignes selon « date »')
    }
    for (const name of ['montant_numeraire', 'nombre_refus', 'preference']) {
      const questions = starterQuestions([{ name, type: 'number' }, { name: 'date', type: 'date' }])
      expect(questions, name).toContain(`Trace l’évolution de « ${name} » selon « date »`)
    }
  })

  it('skips free-text columns as dimensions', () => {
    for (const name of ['title', 'titre', 'description', 'libelle_long', 'commentaire', 'url']) {
      expect(starterQuestions([{ name, type: 'text' }]), name).toEqual([
        OPENER,
        'Propose-moi un graphique pertinent pour cette ressource',
      ])
    }
  })

  it('prefers a categorical column over a text column as dimension', () => {
    const questions = starterQuestions([
      { name: 'nom', type: 'text' },
      { name: 'region', type: 'categorical' },
    ])

    expect(questions).toContain('Compte les lignes par « region »')
  })

  it('compares two dimensions when there is no measure nor date', () => {
    const questions = starterQuestions([
      { name: 'commune', type: 'text' },
      { name: 'ouvert', type: 'boolean' },
    ])

    expect(questions).toEqual([
      OPENER,
      'Compte les lignes par « commune »',
      'Compare le nombre de lignes par « ouvert »',
    ])
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

describe('useAssistantErrorMessage', () => {
  const errorMessage = useAssistantErrorMessage()
  it('maps status codes and falls back', () => {
    expect(errorMessage(Object.assign(new Error('x'), { statusCode: 401 }))).toContain('Veuillez vous reconnecter')
    expect(errorMessage(Object.assign(new Error('x'), { statusCode: 409 }))).toBe('Cette conversation ne peut plus être lue.')
    expect(errorMessage(Object.assign(new Error('x'), { statusCode: 413 }))).toBe('Votre message est trop long.')
    expect(errorMessage(Object.assign(new Error('x'), { statusCode: 429 }))).toContain('Trop de demandes, réessayez dans un instant.')
    expect(errorMessage(Object.assign(new Error('x'), { statusCode: 503 }))).toContain('Assistant indisponible')
    expect(errorMessage(new TypeError('fetch failed'))).toContain('Une erreur est survenue')
  })

  // useChat turns an error event into `new Error(errorText)`.
  it('shows the localized text of an error event of the stream', () => {
    const text = 'Le service d’IA reçoit trop de demandes. Réessayez dans quelques instants.'
    expect(errorMessage(new Error(text))).toBe(text)
    expect(errorMessage(new Error(''))).toContain('Une erreur est survenue')
    expect(errorMessage(Object.assign(new Error('The response body is empty.'), { name: 'AI_EmptyResponseBodyError' }))).toContain('Une erreur est survenue')
  })
})

describe('AssistantSpinner', () => {
  function stubReducedMotion(matches: boolean) {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('cycles its frames, then clears its timer on unmount', async () => {
    stubReducedMotion(false)
    const wrapper = mount(AssistantSpinner)
    const first = wrapper.text()

    await vi.advanceTimersByTimeAsync(80)
    expect(wrapper.text()).not.toBe(first)
    expect(wrapper.attributes('aria-hidden')).toBe('true')

    // Mounting itself leaves an unrelated timer: compare counts around the unmount.
    const timersWhileMounted = vi.getTimerCount()
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(timersWhileMounted - 1)
  })

  it('holds a still frame without any timer under reduced motion', async () => {
    stubReducedMotion(true)
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const wrapper = mount(AssistantSpinner)
    const still = wrapper.text()

    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.text()).toBe(still)
    expect(setIntervalSpy).not.toHaveBeenCalled()
  })
})

/** The collapsible panel of a trace or reasoning block, found through its toggle button. */
function panelOf(block: Pick<ReturnType<typeof mount>, 'find'>) {
  return block.find(`[id="${block.find('button').attributes('aria-controls')}"]`)
}

describe('ToolTrace', () => {
  const trace: ToolTraceModel = {
    label: 'Interrogation des données',
    summary: 'Je calcule la réponse à partir des données',
    error: false,
    errorText: null,
    output: null,
  }

  function mountTrace() {
    return mount(ToolTrace, { props: { trace } })
  }

  // headlessui links the button once the panel is mounted, a tick later.
  it('links the toggle button to the panel with aria-controls', async () => {
    const wrapper = mountTrace()
    await nextTick()
    const button = wrapper.find('button')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(panelOf(wrapper).exists()).toBe(true)
  })

  it('names the toggle button with the label and the summary', () => {
    const button = mountTrace().find('button')

    // No aria-label: the accessible name is the visible label and summary.
    expect(button.attributes('aria-label')).toBeUndefined()
    expect(button.text()).toContain('Interrogation des données')
    expect(button.text()).toContain('Je calcule la réponse à partir des données')
  })

  it('keeps the collapsed panel inert and removes inert when expanded', async () => {
    const wrapper = mountTrace()
    await nextTick()

    expect(panelOf(wrapper).attributes('inert')).toBeDefined()

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(panelOf(wrapper).attributes('inert')).toBeUndefined()
  })

  it('renders the string output in a pre block when expanded', async () => {
    const wrapper = mount(ToolTrace, { props: { trace: { ...trace, output: 'col1 | col2\nval1 | val2' } } })
    await wrapper.find('button').trigger('click')

    const blocks = wrapper.findAll('pre')
    expect(blocks).toHaveLength(1)
    expect(blocks[0]!.text()).toBe('col1 | col2\nval1 | val2')
  })

  it('renders no output block when the trace output is null', async () => {
    const wrapper = mountTrace()
    await wrapper.find('button').trigger('click')

    expect(wrapper.findAll('pre')).toHaveLength(0)
  })
})

const TIMELINE = {
  title: 'Analyse des résultats',
  steps: [
    { label: 'Calcul effectué sur les données', status: 'complete' as const },
    { label: 'J’interprète les résultats obtenus', status: 'active' as const },
  ],
}

describe('AssistantTimeline', () => {
  it('announces only the active step in a status region', () => {
    const wrapper = mount(AssistantTimeline, { props: { timeline: TIMELINE } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.find('.sr-only').text()).toBe('J’interprète les résultats obtenus')
    const visual = wrapper.find('[aria-hidden="true"]')
    expect(visual.text()).toContain('Analyse des résultats')
    expect(visual.text()).toContain('Calcul effectué sur les données')
  })

  it('animates the active step only, its label repeated for the shimmer', () => {
    const shimmers = mount(AssistantTimeline, { props: { timeline: TIMELINE } }).findAll('.assistant-shimmer')
    expect(shimmers).toHaveLength(1)
    expect(shimmers[0]!.attributes('data-text')).toBe('J’interprète les résultats obtenus')
  })

  it('announces the last of several active steps', () => {
    const timeline = {
      title: 'Analyse en cours',
      steps: [
        { label: 'Je calcule la réponse à partir des données', status: 'active' as const },
        { label: 'Je prépare le graphique à partir des résultats', status: 'active' as const },
      ],
    }
    const wrapper = mount(AssistantTimeline, { props: { timeline } })
    expect(wrapper.find('.sr-only').text()).toBe('Je prépare le graphique à partir des résultats')
    expect(wrapper.findAll('.assistant-shimmer')).toHaveLength(2)
  })

  it('announces nothing when no step is active', () => {
    const timeline = { title: 'Analyse des résultats', steps: [{ label: 'Calcul effectué sur les données', status: 'complete' as const }] }
    expect(mount(AssistantTimeline, { props: { timeline } }).find('.sr-only').text()).toBe('')
  })
})

describe('ReasoningBlock', () => {
  const mountBlock = (sentences: string[]) => mount(ReasoningBlock, { props: { sentences }, global: { mocks: { $t: (key: string) => key } } })

  it('lists the sentences, collapsed, under « Raisonnement »', async () => {
    const wrapper = mountBlock(['Première.', 'Seconde.'])
    await nextTick()
    const button = wrapper.find('button')
    expect(button.text()).toBe('Raisonnement')
    expect(button.attributes('aria-label')).toBeUndefined()
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(panelOf(wrapper).attributes('inert')).toBeDefined()
    expect(wrapper.findAll('li').map(li => li.text())).toEqual(['Première.', 'Seconde.'])
  })

  it('numbers several sentences but not a single one', () => {
    expect(mountBlock(['Première.', 'Seconde.']).find('ol').classes()).toContain('list-decimal')
    expect(mountBlock(['Seule.']).find('ol').classes()).not.toContain('list-decimal')
  })

  // DSFR draws its own counter on every ol > li::marker: only content: none removes it.
  it('removes the DSFR marker of a single sentence, keeps it for several', () => {
    expect(mountBlock(['Seule.']).find('li').classes()).toContain('marker:content-none')
    expect(mountBlock(['Première.', 'Seconde.']).find('li').classes()).not.toContain('marker:content-none')
  })
})

describe('ToolsBlock', () => {
  const trace: ToolTraceModel = { label: 'Interrogation des données', summary: '1 ligne', error: false, errorText: null, output: null }

  it('groups the traces, collapsed, under their count', async () => {
    const wrapper = mount(ToolsBlock, { props: { traces: [trace, trace], live: false } })
    await nextTick()
    expect(wrapper.find('button').text()).toBe('Outils utilisés · 2')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.findAll('.tool-trace')).toHaveLength(2)
  })

  it('removes the DSFR counter marker of each trace', () => {
    const items = mount(ToolsBlock, { props: { traces: [trace, trace], live: false } }).findAll('li')
    expect(items.map(li => li.classes())).toEqual([['marker:content-none'], ['marker:content-none']])
  })

  it('titles the running tools while the turn goes on', () => {
    expect(mount(ToolsBlock, { props: { traces: [trace], live: true } }).find('button').text()).toBe('Outils en cours · 1')
  })
})

describe('ChatPanel', () => {
  beforeEach(() => {
    chatState.messages.value = []
    chatState.status.value = 'ready'
    chatState.error.value = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('disables the input and shows a waiting message without a resource', () => {
    const wrapper = mountPanel(null)

    const textarea = wrapper.find('textarea#assistant-input')
    expect(textarea.attributes('disabled')).toBeDefined()
    expect(wrapper.find('#assistant-waiting').exists()).toBe(true)
    expect(wrapper.find('#assistant-waiting').text()).toBe('Chargez une ressource pour permettre à l’assistant de comprendre sa structure.')
  })

  it('welcomes with the exploration title before a resource is chosen', () => {
    const wrapper = mountPanel(null)

    const emptyState = wrapper.find('[data-testid="assistant-empty-state"]')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.find('h3').text()).toBe('Assistant d’exploration de données')
  })

  it('welcomes the user with suggestion buttons built from the schema', () => {
    const wrapper = mountPanel('resource-1', null, { columns: [{ name: 'departement', type: 'categorical' }] })

    expect(wrapper.find('[data-testid="assistant-empty-state"]').exists()).toBe(true)
    const suggestions = wrapper.findAll('[data-testid="assistant-suggestion"]')
    expect(suggestions.length).toBe(3)
    expect(suggestions.every(button => button.element.tagName === 'BUTTON' && button.attributes('type') === 'button')).toBe(true)
    expect(suggestions.map(button => button.text())).toContain('Compte les lignes par « departement »')
  })

  it('titles the welcome and shows the animated mark, swapped for the still logo under reduced motion', () => {
    const wrapper = mountPanel('resource-1')

    const emptyState = wrapper.find('[data-testid="assistant-empty-state"]')
    expect(emptyState.find('h3').text()).toBe('Assistant de visualisation')
    const picture = emptyState.find('picture')
    expect(picture.attributes('aria-hidden')).toBe('true')
    const source = picture.find('source')
    expect(source.attributes('media')).toBe('(prefers-reduced-motion: reduce)')
    expect(source.attributes('srcset')).toBe('/nuxt_images/assistant/assistant-logo.svg')
    const img = picture.find('img')
    expect(img.attributes('src')).toBe('/nuxt_images/assistant/assistant-signature.webp')
    expect(img.attributes('alt')).toBe('')
  })

  it('fills the composer with a clicked suggestion without sending it', async () => {
    const wrapper = mountPanel('resource-1')

    const suggestion = wrapper.find('[data-testid="assistant-suggestion"]')
    await suggestion.trigger('click')

    const textarea = wrapper.find('textarea#assistant-input')
    expect((textarea.element as HTMLTextAreaElement).value).toBe(suggestion.text())
    expect(document.activeElement).toBe(textarea.element)
    expect(sendMessageMock).not.toHaveBeenCalled()
  })

  it('hides the welcome once the conversation has started', () => {
    chatState.messages.value = [assistantTextMessage('Bonjour')]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('[data-testid="assistant-empty-state"]').exists()).toBe(false)
  })

  it('offers no suggestion without a resource', () => {
    const wrapper = mountPanel(null)

    expect(wrapper.findAll('[data-testid="assistant-suggestion"]')).toHaveLength(0)
  })

  it('lists the active resource and its format in a labelled context block', () => {
    const wrapper = mountPanel('resource-1')

    const context = wrapper.find('[aria-label="Contexte utilisé par l’assistant"]')
    expect(context.exists()).toBe(true)
    expect(context.text()).toContain('Table parquet A')
    expect(context.text()).toContain('parquet')
    expect(context.text()).not.toContain('Visualisation en cours')
  })

  it('mentions the current visualization when one is sent', () => {
    const visualization = toAssistantVisualization(CHART as unknown as ChartForApi, false)
    const wrapper = mountPanel('resource-1', visualization)

    expect(wrapper.find('[aria-label="Contexte utilisé par l’assistant"]').text()).toContain('Visualisation en cours')
  })

  it('shows no context block without a resource', () => {
    const wrapper = mountPanel(null)

    expect(wrapper.find('[aria-label="Contexte utilisé par l’assistant"]').exists()).toBe(false)
  })

  it('warns that the assistant can make mistakes, with a link to the guide', () => {
    const wrapper = mountPanel('resource-1')

    expect(wrapper.text()).toContain('L’assistant peut faire des erreurs.')
    const link = wrapper.findAll('a').find(a => a.text() === 'En savoir plus')
    expect(link?.attributes('href')).toBe(GUIDE_URL)
    expect(link?.attributes('target')).toBe('_blank')
  })

  it('announces new messages politely in a log', () => {
    chatState.messages.value = [assistantTextMessage('Bonjour')]
    const wrapper = mountPanel('resource-1')

    const log = wrapper.find('[role="log"]')
    expect(log.exists()).toBe(true)
    expect(log.attributes('aria-live')).toBe('polite')
    expect(log.find('article').exists()).toBe(true)
  })

  it('enables the input once a resource is selected', () => {
    const wrapper = mountPanel('f47ac10b-58cc-4372-a567-0e02b2c3d479')

    const textarea = wrapper.find('textarea#assistant-input')
    expect(textarea.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('#assistant-waiting').exists()).toBe(false)
  })

  it('sends the composer text and clears it', async () => {
    const wrapper = mountPanel('resource-1')

    await wrapper.find('textarea#assistant-input').setValue('Montre-moi un graphique')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')

    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'Montre-moi un graphique' })
    expect((wrapper.find('textarea#assistant-input').element as HTMLTextAreaElement).value).toBe('')
  })

  it('sends on Enter but inserts a newline on Shift+Enter', async () => {
    const wrapper = mountPanel('resource-1')

    const textarea = wrapper.find('textarea#assistant-input')
    await textarea.setValue('Bonjour')

    await textarea.trigger('keydown.enter', { shiftKey: true })
    expect(sendMessageMock).not.toHaveBeenCalled()

    await textarea.trigger('keydown.enter')
    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'Bonjour' })
  })

  it('caps the composer at 4000 characters', () => {
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('textarea#assistant-input').attributes('maxlength')).toBe('4000')
  })

  it('disables the send button when the input is empty or while waiting', async () => {
    const wrapper = mountPanel('resource-1')
    const send = () => wrapper.find('button[aria-label="Envoyer"]')

    expect(send().attributes('disabled')).toBeDefined()

    await wrapper.find('textarea#assistant-input').setValue('ok')
    expect(send().attributes('disabled')).toBeUndefined()

    await wrapper.unmount()
    const waitingWrapper = mountPanel(null)
    expect(waitingWrapper.find('button[aria-label="Envoyer"]').attributes('disabled')).toBeDefined()
  })

  it('shows the character counter beyond 3600 characters, in red at the max', async () => {
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')
    const expected = `${(3601).toLocaleString(locale)} / ${(4000).toLocaleString(locale)}`

    expect(wrapper.text()).not.toContain(` / ${(4000).toLocaleString(locale)}`)

    await textarea.setValue('a'.repeat(3601))
    expect(wrapper.text()).toContain(expected)

    await textarea.setValue('a'.repeat(4000))
    const counter = wrapper.findAll('footer span').find(span => span.text().includes('/'))
    expect(counter).toBeDefined()
    expect(counter!.classes()).toContain('text-new-error')
  })

  it('describes the field by the counter and announces each limit once', async () => {
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')
    const notice = () => wrapper.find('[data-testid="chat-length-status"]').text()
    const max = (4000).toLocaleString(locale)

    expect(textarea.attributes('aria-describedby')).toBeUndefined()
    await textarea.setValue('a'.repeat(3601))
    expect(textarea.attributes('aria-describedby')).toBe('assistant-input-counter')
    expect(wrapper.find('#assistant-input-counter').text()).toContain('caractères')
    expect(notice()).toBe(`Votre demande approche de la limite de ${max} caractères.`)

    await textarea.setValue('a'.repeat(4000))
    expect(notice()).toBe(`Limite de ${max} caractères atteinte.`)
    // Editing at the limit keeps the notice: nothing new is announced.
    await textarea.setValue('a'.repeat(3999))
    expect(notice()).toBe(`Limite de ${max} caractères atteinte.`)

    await textarea.setValue('court')
    expect(notice()).toBe('')
  })

  describe('timeline', () => {
    const question = { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Question' }] }
    const okQuery = (input: Record<string, unknown> = {}) => ({ type: 'tool-query_data', toolCallId: 'q1', state: 'output-available', input, output: { status: 'ok', table: 'n\n1', rows: 1, total: 1, more_groups: false } })
    const timelines = (wrapper: ReturnType<typeof mountPanel>) => wrapper.findAll('[data-testid="assistant-timeline"]')

    it('appears once the message is sent, planning the answer', () => {
      chatState.status.value = 'submitted'
      chatState.messages.value = [question]
      const wrapper = mountPanel('resource-1')
      expect(timelines(wrapper)).toHaveLength(1)
      expect(timelines(wrapper)[0]!.find('.sr-only').text()).toBe('Planification de la réponse…')
    })

    it('moves into the streamed reply, still planning while it has nothing to show', () => {
      chatState.status.value = 'streaming'
      chatState.messages.value = [question, { id: 'a1', role: 'assistant', parts: [{ type: 'step-start' }] }]
      const wrapper = mountPanel('resource-1')
      expect(timelines(wrapper)).toHaveLength(1)
      expect(wrapper.find('article[data-message-role="assistant"] [data-testid="assistant-timeline"]').text()).toContain('Planification de la réponse…')
    })

    it('follows a running tool, its trace in a running tools block', () => {
      chatState.status.value = 'streaming'
      chatState.messages.value = [question, { id: 'a1', role: 'assistant', parts: [{ type: 'tool-query_data', toolCallId: 'q1', state: 'input-available', input: {} }] }]
      const wrapper = mountPanel('resource-1')
      expect(timelines(wrapper)[0]!.text()).toContain('Analyse en cours')
      expect(timelines(wrapper)[0]!.text()).toContain('Je calcule la réponse à partir des données')
      expect(wrapper.find('.tools-block button').text()).toBe('Outils en cours · 1')
      expect(wrapper.find('.reasoning-block').exists()).toBe(false)
    })

    it('interprets the results, then writes the answer', async () => {
      chatState.status.value = 'streaming'
      chatState.messages.value = [question, { id: 'a1', role: 'assistant', parts: [okQuery()] }]
      const wrapper = mountPanel('resource-1')
      expect(timelines(wrapper)[0]!.find('.sr-only').text()).toBe('J’interprète les résultats obtenus')

      chatState.messages.value = [question, { id: 'a1', role: 'assistant', parts: [okQuery(), { type: 'text', text: 'Voici' }] }]
      await nextTick()
      expect(timelines(wrapper)[0]!.find('.sr-only').text()).toBe('Je rédige la réponse')
      expect(wrapper.text()).toContain('Voici')
    })

    it('gives way to the reasoning and the used tools once the turn ends', () => {
      chatState.messages.value = [question, { id: 'a1', role: 'assistant', parts: [okQuery({ purpose: 'Compter les logements par région' }), { type: 'text', text: 'Voici' }] }]
      const wrapper = mountPanel('resource-1')
      expect(timelines(wrapper)).toHaveLength(0)
      expect(wrapper.find('.reasoning-block').text()).toContain('J’ai compris votre demande ainsi : Compter les logements par région.')
      expect(wrapper.find('.tools-block button').text()).toBe('Outils utilisés · 1')
    })

    it('shows no reasoning nor tools block for a reply without tools', () => {
      chatState.messages.value = [question, assistantTextMessage('Bonjour')]
      const wrapper = mountPanel('resource-1')
      expect(wrapper.find('.reasoning-block').exists()).toBe(false)
      expect(wrapper.find('.tools-block').exists()).toBe(false)
      expect(timelines(wrapper)).toHaveLength(0)
    })
  })

  it('shows a stop button while responding that stops the stream', async () => {
    chatState.status.value = 'streaming'
    const wrapper = mountPanel('resource-1')

    const button = wrapper.findAll('button').find(b => b.text() === 'Arrêter')
    expect(button).toBeDefined()
    expect(wrapper.find('button[aria-label="Envoyer"]').exists()).toBe(false)

    await button!.trigger('click')
    expect(stopMock).toHaveBeenCalled()
  })

  // udata keeps no cancelled run: the next question must not look like it follows the stopped one.
  it('drops the stopped turn from the history and restores its text in the composer', async () => {
    const answered = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Première question' }] },
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Réponse' }] },
    ]
    chatState.messages.value = [...answered]
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')

    await textarea.setValue('Question arrêtée')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    chatState.messages.value = [
      ...answered,
      { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Question arrêtée' }] },
      { id: 'a2', role: 'assistant', parts: [{ type: 'text', text: 'Début de répo' }] },
    ]
    chatState.status.value = 'streaming'
    await nextTick()
    stopMock.mockImplementationOnce(async () => {
      chatState.status.value = 'ready'
    })
    await wrapper.findAll('button').find(b => b.text() === 'Arrêter')!.trigger('click')
    await flushPromises()

    expect(chatState.messages.value).toEqual(answered)
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Question arrêtée')
  })

  it('leaves the composer empty when a new conversation interrupts the stream', async () => {
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')
    await textarea.setValue('Question abandonnée')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    chatState.messages.value = [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Question abandonnée' }] }]
    chatState.status.value = 'streaming'
    await nextTick()
    newConversationMock.mockImplementationOnce(() => {
      chatState.messages.value = []
      chatState.status.value = 'ready'
    })

    await wrapper.find('[data-testid="assistant-new-conversation"]').trigger('click')
    await flushPromises()

    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('sends a double click once', async () => {
    const wrapper = mountPanel('resource-1')
    await wrapper.find('textarea#assistant-input').setValue('premier')
    const send = wrapper.find('button[aria-label="Envoyer"]')

    await send.trigger('click')
    await send.trigger('click')

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'premier' })
  })

  it('sends a retry right after a fast failure', async () => {
    const wrapper = mountPanel('resource-1')
    await wrapper.find('textarea#assistant-input').setValue('premier')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')

    chatState.status.value = 'error'
    chatState.error.value = new Error('fetch failed')
    await nextTick()
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')

    expect(sendMessageMock).toHaveBeenCalledTimes(2)
    expect(sendMessageMock).toHaveBeenLastCalledWith({ text: 'premier' })
  })

  it('renders assistant text as markdown', () => {
    chatState.messages.value = [assistantTextMessage('Voici **le** résultat avec un `code`.')]
    const wrapper = mountPanel('resource-1')

    const markdown = wrapper.find('.prose')
    expect(markdown.exists()).toBe(true)
    expect(markdown.html()).toContain('<strong>le</strong>')
    expect(markdown.html()).toContain('<code>code</code>')
  })

  it('right-aligns user messages and marks both roles with data-message-role', () => {
    chatState.messages.value = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Montre un graphique' }] },
      assistantTextMessage('Voici le résultat.'),
    ]
    const wrapper = mountPanel('resource-1')

    const articles = wrapper.findAll('article')
    expect(articles).toHaveLength(2)

    const userArticle = articles[0]
    expect(userArticle.attributes('data-message-role')).toBe('user')
    expect(userArticle.classes()).toContain('ml-auto')
    expect(userArticle.find('div.whitespace-pre-wrap').text()).toBe('Montre un graphique')

    const assistantArticle = articles[1]
    expect(assistantArticle.attributes('data-message-role')).toBe('assistant')
    expect(assistantArticle.classes()).not.toContain('ml-auto')
    expect(assistantArticle.find('div.whitespace-pre-wrap').exists()).toBe(false)
    expect(assistantArticle.find('.prose').exists()).toBe(true)
  })

  it('renders user text as plain text, preserving newlines and ignoring markdown syntax', () => {
    chatState.messages.value = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Ligne 1\n**pas de gras**' }] },
    ]
    const wrapper = mountPanel('resource-1')

    const bubble = wrapper.find('article[data-message-role="user"] div.whitespace-pre-wrap')
    expect(bubble.text()).toBe('Ligne 1\n**pas de gras**')
    expect(bubble.find('strong').exists()).toBe(false)
  })

  it('never shows the raw reasoning', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'reasoning', text: 'The user wants a chart.', state: 'done' },
        { type: 'text', text: 'Voici le résultat.' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.text()).not.toContain('The user wants')
    expect(wrapper.find('.reasoning-block').exists()).toBe(false)
  })

  it('renders query_data traces with a row summary, not raw JSON', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-available', input: { group_by: 'year' }, output: { status: 'ok', table: 'year | nb\n2020 | 3\n2021 | 4', rows: 2, total: null, more_groups: false } },
        { type: 'text', text: 'J’ai trouvé 2 lignes.' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const trace = wrapper.find('.tool-trace')
    expect(trace.exists()).toBe(true)
    expect(trace.text()).toContain('Interrogation des données')
    expect(trace.text()).toContain('2 lignes')
    expect(wrapper.text()).toContain('J’ai trouvé 2 lignes.')
  })

  it('renders images of assistant replies as their alt text', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Résultat ![graphe](https://evil.example/?d=secret)' }],
    }]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('evil.example')
    expect(wrapper.text()).toContain('graphe')
  })

  it('maps tool types to French labels and first-person summaries', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-create_chart', state: 'input-available', input: {} },
        { type: 'tool-unknown', state: 'output-available', input: {}, output: {} },
      ],
    }]
    const wrapper = mountPanel('resource-1')
    const text = wrapper.text()

    expect(text).toContain('Création du graphique')
    expect(text).toContain('Je construis le graphique')
    expect(text).toContain('Opération')
    expect(text).toContain('Je poursuis l’analyse')
  })

  it('renders one card per displayed tool call, in arrival order, without merging calls to the same tool', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-error', input: {}, errorText: 'boom' },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'ok', table: 'n\n1', rows: 1, total: 1, more_groups: false } },
        { type: 'tool-create_chart', state: 'input-available', input: {} },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'ok', table: 'n\n2', rows: 1, total: 1, more_groups: false } },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    // The failure the same tool then recovered from is hidden.
    const traces = wrapper.findAll('.tool-trace')
    expect(traces).toHaveLength(3)
    expect(traces[0]!.find('pre').text()).toContain('1')
    expect(traces[1]!.text()).toContain('Création du graphique')
    expect(traces[2]!.find('pre').text()).toContain('2')
    expect(wrapper.text()).not.toContain('boom')
    expect(wrapper.find('.tools-block button').text()).toBe('Outils utilisés · 3')
  })

  it('renders failed tool traces in red with the error message', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-error', input: {}, errorText: 'relation « data » inexistante' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const trace = wrapper.find('.tool-trace')
    expect(trace.text()).toContain('relation « data » inexistante')
    const summary = wrapper.findAll('span').find(span => span.text() === 'relation « data » inexistante')
    expect(summary!.classes()).toContain('text-new-error')
  })

  it('renders an unrecovered tool refusal in red with a warning icon', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-available', input: {}, output: { status: 'error', errors: ['Unknown column: x.'] } },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const trace = wrapper.find('.tool-trace')
    const summary = trace.findAll('span').find(span => span.text() === 'Requête non exécutée')
    expect(summary!.classes()).toContain('text-new-error')
    expect(trace.find('svg.text-new-error').exists()).toBe(true)
    expect(trace.find('p.text-new-error').exists()).toBe(false)
    expect(trace.find('pre').text()).toBe('Unknown column: x.')
  })

  it('displays the mapped French error message', async () => {
    chatState.error.value = Object.assign(new Error('Too Many Requests'), { statusCode: 429 })
    const wrapper = mountPanel('resource-1')
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Trop de demandes, réessayez dans un instant.')
    // Waiting helps here, not a new conversation.
    expect(alert.find('button').exists()).toBe(false)
  })

  it('offers a new conversation only once the conversation has started', async () => {
    const empty = mountPanel('resource-1')
    expect(empty.find('[data-testid="assistant-new-conversation"]').exists()).toBe(false)
    empty.unmount()

    chatState.messages.value = [assistantTextMessage('Bonjour')]
    const wrapper = mountPanel('resource-1')
    const button = wrapper.find('[data-testid="assistant-new-conversation"]')
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toBe('Nouvelle conversation')
    await button.trigger('click')
    expect(newConversationMock).toHaveBeenCalledOnce()
  })

  // RGAA 12.8: the button leaves the DOM with the conversation, the focus must not fall to the body.
  it('moves the focus to the composer once a new conversation starts', async () => {
    chatState.messages.value = [assistantTextMessage('Bonjour')]
    newConversationMock.mockImplementationOnce(() => {
      chatState.messages.value = []
    })
    const wrapper = mountPanel('resource-1')
    const button = wrapper.find<HTMLButtonElement>('[data-testid="assistant-new-conversation"]')
    button.element.focus()
    await button.trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="assistant-new-conversation"]').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.find('textarea').element)
  })

  it('invites to start a new conversation when udata can no longer read it', async () => {
    chatState.messages.value = [assistantTextMessage('Bonjour')]
    chatState.error.value = Object.assign(new Error('Conflict'), { statusCode: 409 })
    const wrapper = mountPanel('resource-1')
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.text()).toContain('Cette conversation ne peut plus être lue.')
    const restart = alert.find('button')
    expect(restart.text()).toBe('Commencer une nouvelle conversation')
    await restart.trigger('click')
    expect(newConversationMock).toHaveBeenCalledOnce()
  })

  it('offers no new conversation for a message too long', async () => {
    chatState.error.value = Object.assign(new Error('Payload Too Large'), { statusCode: 413 })
    const wrapper = mountPanel('resource-1')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('Votre message est trop long.')
    expect(wrapper.find('[role="alert"] button').exists()).toBe(false)
  })

  it('rebuilds only the streaming message on each chunk', async () => {
    const finished = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Question' }] },
      assistantTextMessage('Première réponse'),
      { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Suite' }] },
    ]
    // useChat keeps the id of the streaming message and gives it a new object per chunk.
    const chunk = (text: string) => ({ id: 'a2', role: 'assistant', parts: [{ type: 'text', text }] })
    chatState.status.value = 'streaming'
    chatState.messages.value = [...finished, chunk('Déb')]
    mountPanel('resource-1')
    await nextTick()
    buildSpy.mockClear()

    const streaming = chunk('Début de la réponse')
    chatState.messages.value = [...finished, streaming]
    await nextTick()

    // Panels mounted by earlier tests watch the same messages: compare what is rebuilt.
    expect(new Set(buildSpy.mock.calls.map(([parts]) => parts))).toEqual(new Set([streaming.parts]))
  })

  it('restores the sent text in the composer when the request fails', async () => {
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')

    await textarea.setValue('Message perdu ?')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')

    chatState.status.value = 'error'
    chatState.error.value = new Error('fetch failed')
    await nextTick()

    expect((textarea.element as HTMLTextAreaElement).value).toBe('Message perdu ?')
  })

  it('drops the failed turn from the history so a retry does not duplicate it', async () => {
    const answered = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Première question' }] },
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'Réponse' }] },
    ]
    chatState.messages.value = [...answered]
    const wrapper = mountPanel('resource-1')

    await wrapper.find('textarea#assistant-input').setValue('Question en échec')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    // useChat keeps the user message, and a partial reply when the stream breaks.
    chatState.messages.value = [
      ...answered,
      { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Question en échec' }] },
      { id: 'a2', role: 'assistant', parts: [{ type: 'text', text: 'Début de répo' }] },
    ]
    chatState.status.value = 'error'
    chatState.error.value = new Error('fetch failed')
    await nextTick()

    expect(chatState.messages.value).toEqual(answered)
  })

  it('keeps the composer cleared when the request succeeds', async () => {
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')

    await textarea.setValue('Message envoyé')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    chatState.status.value = 'submitted'
    await nextTick()
    chatState.status.value = 'ready'
    await nextTick()

    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('refocuses the textarea once the request finishes', async () => {
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')

    // Simulate the request lifecycle: submitted while sending, ready when done.
    await textarea.setValue('ok')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    chatState.status.value = 'submitted'
    await nextTick()
    chatState.status.value = 'ready'
    // The watcher awaits a nextTick before focusing: flush twice.
    await flushPromises()
    await nextTick()

    expect(document.activeElement).toBe(textarea.element)
  })

  it('keeps the composer usable after an error status', async () => {
    // useChat leaves the status on 'error' after a failed request until the next
    // one starts: the composer must not stay disabled.
    chatState.status.value = 'error'
    chatState.error.value = Object.assign(new Error('fetch failed'), {})
    const wrapper = mountPanel('resource-1')

    const textarea = wrapper.find('textarea#assistant-input')
    expect(textarea.attributes('disabled')).toBeUndefined()

    await textarea.setValue('On réessaie ?')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')

    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'On réessaie ?' })
  })

  it('still disables the composer while a request is in flight', () => {
    chatState.status.value = 'streaming'
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('textarea#assistant-input').attributes('disabled')).toBeDefined()
  })

  describe('chart-result', () => {
    const chart = { ...CHART }
    const createPart = (state: string, id = 'call-1') => ({
      type: 'tool-create_chart',
      toolCallId: id,
      state,
      input: {},
      ...(state === 'output-available' ? { output: { status: 'ok', chart, more_groups: false } } : {}),
    })

    it('emits chart-result when the tool output arrives', async () => {
      chatState.messages.value = [{ id: 'a1', role: 'assistant', parts: [createPart('input-available')] }]
      const wrapper = mountPanel('resource-1')
      expect(wrapper.emitted('chart-result')).toBeUndefined()

      chatState.messages.value = [{ id: 'a1', role: 'assistant', parts: [createPart('output-available')] }]
      await nextTick()
      expect(wrapper.emitted('chart-result')).toHaveLength(1)
      expect(wrapper.emitted('chart-result')![0]![0]).toMatchObject({ toolCallId: 'call-1', kind: 'create' })
    })

    it('does not emit again for a message that did not change', async () => {
      const wrapper = mountPanel('resource-1')
      const answered = { id: 'a1', role: 'assistant', parts: [createPart('output-available')] }
      chatState.messages.value = [answered]
      await nextTick()
      chatState.messages.value = [answered, { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Et ensuite ?' }] }]
      await nextTick()

      expect(wrapper.emitted('chart-result')).toHaveLength(1)
    })

    it('emits a tool call once while its message keeps streaming', async () => {
      const wrapper = mountPanel('resource-1')
      const chunk = (text: string) => ({ id: 'a1', role: 'assistant', parts: [createPart('output-available'), { type: 'text', text }] })
      chatState.messages.value = [chunk('Voici')]
      await nextTick()
      chatState.messages.value = [chunk('Voici le graphique')]
      await nextTick()

      expect(wrapper.emitted('chart-result')).toHaveLength(1)
    })

    it('emits a distinct result for each new tool call', async () => {
      const wrapper = mountPanel('resource-1')
      chatState.messages.value = [{ id: 'a1', role: 'assistant', parts: [createPart('output-available', 'c1')] }]
      await nextTick()
      chatState.messages.value = [{
        id: 'a1',
        role: 'assistant',
        parts: [
          createPart('output-available', 'c1'),
          { type: 'tool-update_chart', toolCallId: 'c2', state: 'output-available', input: {}, output: { status: 'ok', patch: { title: 'Nouveau' } } },
        ],
      }]
      await nextTick()

      expect(wrapper.emitted('chart-result')!.at(-1)![0]).toMatchObject({ toolCallId: 'c2', kind: 'update' })
    })
  })
})
