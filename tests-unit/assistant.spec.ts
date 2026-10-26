// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChatPanel from '~/components/Assistant/ChatPanel.vue'
import { buildChatBody, extractLastSqlBlock, mapAssistantError } from '~/utils/assistant'

const sendMessageMock = vi.hoisted(() => vi.fn())
const stopMock = vi.hoisted(() => vi.fn())

// State shared with the mocked useAssistantChat. The mock factory (which runs
// after imports) fills it with real Vue refs; tests set state before mounting.
const chatState = vi.hoisted(() => ({} as {
  messages: import('vue').Ref<Array<{ id: string, role: string, parts: Array<Record<string, unknown>> }>>
  status: import('vue').Ref<string>
  error: import('vue').Ref<unknown>
}))

vi.mock('~/components/Assistant/useAssistantChat', async () => {
  const { ref } = await import('vue')
  chatState.messages = ref([])
  chatState.status = ref('ready')
  chatState.error = ref(null)
  return {
    useAssistantChat: () => ({ ...chatState, sendMessage: sendMessageMock, stop: stopMock }),
  }
})

function assistantTextMessage(text: string) {
  return {
    id: `msg-${Math.random().toString(36).slice(2)}`,
    role: 'assistant',
    parts: [{ type: 'text', text }],
  }
}

function mountPanel(resourceId: string | null) {
  return mount(ChatPanel, {
    props: { resourceId },
    global: {
      mocks: { $t: (key: string) => key },
    },
  })
}

describe('extractLastSqlBlock', () => {
  it('returns the last sql block when several are present', () => {
    const text = 'Voici une requête :\n```sql\nSELECT 1\n```\nEt une autre :\n```sql\nSELECT year, COUNT(*) AS nb FROM data GROUP BY year\n```'
    expect(extractLastSqlBlock(text)).toBe('SELECT year, COUNT(*) AS nb FROM data GROUP BY year')
  })

  it('returns null when there is no sql block', () => {
    expect(extractLastSqlBlock('Aucune requête ici.')).toBeNull()
    expect(extractLastSqlBlock('```json\n{"a": 1}\n```')).toBeNull()
    expect(extractLastSqlBlock('')).toBeNull()
  })

  it('matches the sql fence case-insensitively', () => {
    expect(extractLastSqlBlock('```SQL\nSELECT 42\n```')).toBe('SELECT 42')
    expect(extractLastSqlBlock('```Sql\nSELECT 42\n```')).toBe('SELECT 42')
  })
})

describe('buildChatBody', () => {
  const messages = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Bonjour' }] }]

  it('includes resource_id when a resource is selected', () => {
    expect(buildChatBody(messages, 'f47ac10b-58cc-4372-a567-0e02b2c3d479')).toEqual({
      messages,
      resource_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
  })

  it('omits resource_id when no resource is selected', () => {
    const body = buildChatBody(messages, null)
    expect(body).toEqual({ messages })
    expect(body).not.toHaveProperty('resource_id')
  })
})

describe('mapAssistantError', () => {
  it('maps 401 to a reconnection message', () => {
    expect(mapAssistantError(Object.assign(new Error('Unauthorized'), { statusCode: 401 }))).toContain('Veuillez vous reconnecter')
  })

  it('maps 429 to a quota message', () => {
    expect(mapAssistantError(Object.assign(new Error('Too Many Requests'), { statusCode: 429 }))).toContain('Quota journalier dépassé')
  })

  it('maps 503 to a configuration message', () => {
    expect(mapAssistantError(Object.assign(new Error('Service Unavailable'), { statusCode: 503 }))).toContain('Assistant non configuré')
  })

  it('falls back to a generic message for network errors', () => {
    expect(mapAssistantError(new TypeError('fetch failed'))).toContain('Une erreur est survenue')
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
    expect(wrapper.find('#assistant-waiting').text()).toContain('Sélectionnez une ressource')
    expect(wrapper.text()).not.toContain('Utiliser cette requête')
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
    await wrapper.find('form').trigger('submit.prevent')

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
    const send = () => wrapper.find('button[type="submit"]')

    expect(send().attributes('disabled')).toBeDefined()

    await wrapper.find('textarea#assistant-input').setValue('ok')
    expect(send().attributes('disabled')).toBeUndefined()

    await wrapper.unmount()
    const waitingWrapper = mountPanel(null)
    expect(waitingWrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
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

  it('shows a stop button while responding that stops the stream', async () => {
    chatState.status.value = 'streaming'
    const wrapper = mountPanel('resource-1')

    const button = wrapper.findAll('button').find(b => b.text() === 'Arrêter')
    expect(button).toBeDefined()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)

    await button!.trigger('click')
    expect(stopMock).toHaveBeenCalled()
  })

  it('ignores a second submit within the anti-double-send cooldown', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000)
    const wrapper = mountPanel('resource-1')
    const textarea = wrapper.find('textarea#assistant-input')

    await textarea.setValue('premier')
    await wrapper.find('form').trigger('submit.prevent')
    await textarea.setValue('second')
    await wrapper.find('form').trigger('submit.prevent')

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'premier' })
    now.mockRestore()
  })

  it('emits use-query with the SQL of the last assistant message', async () => {
    chatState.messages.value = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Une requête ?' }] },
      assistantTextMessage('Voici la requête :\n```sql\nSELECT year, rate FROM data\n```'),
    ]
    const wrapper = mountPanel('resource-1')

    const button = wrapper.findAll('button').find(b => b.text() === 'Utiliser cette requête')
    expect(button).toBeDefined()
    await button!.trigger('click')

    expect(wrapper.emitted('use-query')).toHaveLength(1)
    expect(wrapper.emitted('use-query')![0]).toEqual(['SELECT year, rate FROM data'])
  })

  it('hides the use-query button when the last assistant message has no SQL block', () => {
    chatState.messages.value = [assistantTextMessage('Je ne peux pas écrire de requête pour ça.')]
    const wrapper = mountPanel('resource-1')

    expect(wrapper.findAll('button').some(b => b.text() === 'Utiliser cette requête')).toBe(false)
  })

  it('copies the extracted SQL to the clipboard', async () => {
    chatState.messages.value = [assistantTextMessage('```sql\nSELECT 1\n```')]
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const wrapper = mountPanel('resource-1')
    const button = wrapper.findAll('button').find(b => b.text() === 'Copier')
    expect(button).toBeDefined()
    await button!.trigger('click')

    expect(writeText).toHaveBeenCalledWith('SELECT 1')
    vi.unstubAllGlobals()
  })

  it('renders execute_sql traces with the SQL, not raw JSON', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-execute_sql',
          state: 'output-available',
          input: { sql: 'SELECT year, COUNT(*) AS nb FROM data GROUP BY year', purpose: 'Compter par année' },
          output: { rowCount: 12, columns: ['year', 'nb'] },
        },
        { type: 'text', text: 'J’ai trouvé 12 lignes.' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const trace = wrapper.find('.tool-trace')
    expect(trace.exists()).toBe(true)
    expect(trace.text()).toContain('Exécution de la requête SQL')
    expect(trace.find('pre').text()).toContain('SELECT year, COUNT(*) AS nb FROM data GROUP BY year')
    expect(trace.text()).not.toContain('{"sql"')
    expect(wrapper.text()).toContain('J’ai trouvé 12 lignes.')
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

  it('groups consecutive calls to the same tool and state into a single card', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-execute_sql', state: 'output-available', input: { sql: 'SELECT 1' }, output: { rowCount: 1 } },
        { type: 'tool-execute_sql', state: 'output-available', input: { sql: 'SELECT 2' }, output: { rowCount: 1 } },
        { type: 'text', text: 'ok' },
      ],
    }]
    const wrapper = mountPanel('resource-1')

    const traces = wrapper.findAll('.tool-trace')
    expect(traces).toHaveLength(1)
    expect(traces[0].text()).toContain('×2')
  })

  it('keeps consecutive calls in separate cards when their states differ', () => {
    chatState.messages.value = [{
      id: 'a1',
      role: 'assistant',
      parts: [
        { type: 'tool-execute_sql', state: 'output-error', input: { sql: 'SELECT 1' }, errorText: 'syntax error' },
        { type: 'tool-execute_sql', state: 'output-available', input: { sql: 'SELECT 2' }, output: { rowCount: 1 } },
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
        { type: 'tool-execute_sql', state: 'output-error', input: { sql: 'SELECT 1' }, errorText: 'relation « data » inexistante' },
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

  it('keeps the composer usable after an error status', async () => {
    // useChat leaves the status on 'error' after a failed request until the next
    // one starts: the composer must not stay disabled.
    chatState.status.value = 'error'
    chatState.error.value = Object.assign(new Error('fetch failed'), {})
    const wrapper = mountPanel('resource-1')

    const textarea = wrapper.find('textarea#assistant-input')
    expect(textarea.attributes('disabled')).toBeUndefined()

    await textarea.setValue('On réessaie ?')
    await wrapper.find('form').trigger('submit.prevent')

    expect(sendMessageMock).toHaveBeenCalledWith({ text: 'On réessaie ?' })
  })

  it('still disables the composer while a request is in flight', () => {
    chatState.status.value = 'streaming'
    const wrapper = mountPanel('resource-1')

    expect(wrapper.find('textarea#assistant-input').attributes('disabled')).toBeDefined()
  })

  it('survives a clipboard rejection without feedback', async () => {
    chatState.messages.value = [assistantTextMessage('```sql\nSELECT 1\n```')]
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const wrapper = mountPanel('resource-1')
    const button = wrapper.findAll('button').find(b => b.text() === 'Copier')
    await button!.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith('SELECT 1')
    expect(wrapper.text()).toContain('Copier')
    expect(wrapper.text()).not.toContain('Copié !')
    vi.unstubAllGlobals()
  })
})
