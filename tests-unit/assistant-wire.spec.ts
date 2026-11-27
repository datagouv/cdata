// @vitest-environment happy-dom
// Pins the real wire contract of useAssistantChat without stubbing it: @ai-sdk/vue's
// useChat is mocked to capture its init, and the transport built by the composable is
// exercised directly (api URL, authentication, prepared request body).
import { flushPromises } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChat } from '@ai-sdk/vue'
import { useAssistantChat } from '~/components/Assistant/useAssistantChat'
import { useAssistantModels } from '~/components/Assistant/useAssistantModels'

vi.mock('@ai-sdk/vue', () => ({
  useChat: vi.fn(() => ({ messages: ref([]), stop: vi.fn(), clearError: vi.fn(), sendMessage: vi.fn() })),
}))

const MESSAGES = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Bonjour' }] }]

type TransportInit = {
  api: string
  credentials: RequestCredentials | undefined
  headers: Record<string, string> | undefined
  prepareSendMessagesRequest: (options: { messages: unknown[], id: string, trigger: 'submit-message', messageId: string | undefined }) => Promise<{ body: unknown }> | { body: unknown }
}

type ChatInit = {
  onFinish: (event: { message: { metadata?: unknown }, isAbort?: boolean, isError?: boolean }) => void
}

function capturedInit() {
  return vi.mocked(useChat).mock.calls[0]![0] as unknown as ChatInit
}

const USAGE = { inputTokens: 900, outputTokens: 100, totalTokens: 1000 }
const finished = { message: { metadata: { usage: USAGE } }, isAbort: false, isError: false }

function capturedTransport() {
  expect(useChat).toHaveBeenCalledOnce()
  const init = vi.mocked(useChat).mock.calls[0]![0] as unknown as { transport: TransportInit }
  return init.transport
}

describe('useAssistantChat wire contract', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        apiBase: 'https://api.example',
      },
    }))
    vi.stubGlobal('useTranslation', () => ({ locale: 'fr' }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('targets the assistant chat endpoint with credentials included', () => {
    useAssistantChat(ref(null), () => null)
    const transport = capturedTransport()

    expect(transport.api).toBe('https://api.example/api/1/assistant/chat/?lang=fr')
    expect(transport.credentials).toBe('include')
    expect(transport.headers).toEqual({})
  })

  it('sends the current locale as the lang query parameter', () => {
    vi.stubGlobal('useTranslation', () => ({ locale: 'en' }))

    useAssistantChat(ref(null), () => null)

    expect(capturedTransport().api).toBe('https://api.example/api/1/assistant/chat/?lang=en')
  })

  it('authenticates with the dev API key instead of the session cookie when configured', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        apiBase: 'https://api.example',
        devApiKey: 'a-dev-key',
      },
    }))

    useAssistantChat(ref(null), () => null)
    const transport = capturedTransport()

    expect(transport.headers).toEqual({ 'X-API-KEY': 'a-dev-key' })
    expect(transport.credentials).toBeUndefined()
  })

  it('starts a new conversation by stopping the stream and clearing the history and the error', () => {
    const chat = useAssistantChat(ref('resource-1'), () => null)

    chat.messages.value = [...MESSAGES] as typeof chat.messages.value
    chat.newConversation()

    expect(chat.messages.value).toEqual([])
    expect(chat.stop).toHaveBeenCalled()
    expect(chat.clearError).toHaveBeenCalled()
  })

  it('clears the message history when the selected resource changes', async () => {
    const resourceId = ref<string | null>('resource-1')
    const chat = useAssistantChat(resourceId, () => null)

    chat.messages.value = [...MESSAGES] as typeof chat.messages.value
    resourceId.value = 'resource-2'
    await nextTick()

    expect(chat.messages.value).toEqual([])
    expect(chat.stop).toHaveBeenCalled()
    expect(chat.clearError).toHaveBeenCalled()
  })

  it('sends the selected resource_id, or null without one', async () => {
    const resourceId = ref<string | null>('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    useAssistantChat(resourceId, () => null)
    const transport = capturedTransport()

    const withResource = await transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })
    // Protocol fields (id/trigger/messageId) are required by the backend's
    // VercelAIAdapter (SubmitMessage discriminated union) and must not be dropped.
    expect(withResource.body).toEqual({ id: expect.any(String), trigger: 'submit-message', messageId: undefined, messages: MESSAGES, resource_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', visualization: null, model: null })

    resourceId.value = null
    const withoutResource = await transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })
    expect(withoutResource.body).toEqual({ id: expect.any(String), trigger: 'submit-message', messageId: undefined, messages: MESSAGES, resource_id: null, visualization: null, model: null })
  })

  it('sends only the new question: udata holds the history', async () => {
    useAssistantChat(ref(null), () => null)
    const answer = { id: '2', role: 'assistant', parts: [{ type: 'text', text: 'Salut' }] }
    const question = { id: '3', role: 'user', parts: [{ type: 'text', text: 'Et ensuite ?' }] }

    const { body } = await capturedTransport().prepareSendMessagesRequest({ messages: [...MESSAGES, answer, question], id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })

    expect(body).toMatchObject({ messages: [question] })
  })

  it('keeps the conversation id across questions and renews it with a new conversation', async () => {
    const chat = useAssistantChat(ref(null), () => null)
    const transport = capturedTransport()
    const sentId = async () => ((await transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })).body as { id: string }).id

    const first = await sentId()
    expect(await sentId()).toBe(first)
    chat.newConversation()
    expect(await sentId()).not.toBe(first)
  })

  it('sends the current visualization read at send time', async () => {
    let visualization: unknown = { title: 'A' }
    useAssistantChat(ref('r1'), () => visualization as never)
    const transport = capturedTransport()
    const send = () => transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'c', trigger: 'submit-message' as const, messageId: undefined })

    expect((await send()).body).toMatchObject({ resource_id: 'r1', visualization: { title: 'A' } })
    visualization = { title: 'B' }
    expect((await send()).body).toMatchObject({ visualization: { title: 'B' } })
  })

  it('sends the chosen model, then keeps it for the next questions', async () => {
    const chat = useAssistantChat(ref(null), () => null)
    const transport = capturedTransport()
    const send = () => transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'c', trigger: 'submit-message' as const, messageId: undefined })

    chat.selectModel('mistral-medium-3-5')

    expect(chat.modelId.value).toBe('mistral-medium-3-5')
    expect((await send()).body).toMatchObject({ model: 'mistral-medium-3-5' })
    expect((await send()).body).toMatchObject({ model: 'mistral-medium-3-5' })
  })

  it('starts a new conversation when the model changes', async () => {
    const chat = useAssistantChat(ref(null), () => null)
    const transport = capturedTransport()
    const sentId = async () => ((await transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })).body as { id: string }).id
    chat.messages.value = [...MESSAGES] as typeof chat.messages.value
    const first = await sentId()

    chat.selectModel('mistral-medium-3-5')

    expect(chat.messages.value).toEqual([])
    expect(chat.stop).toHaveBeenCalled()
    expect(chat.clearError).toHaveBeenCalled()
    expect(await sentId()).not.toBe(first)
  })

  describe('usage', () => {
    it('records the usage of the finished turn', () => {
      const chat = useAssistantChat(ref(null), () => null)

      chat.sendMessage({ text: 'Q' })
      expect(vi.mocked(useChat).mock.results[0]!.value.sendMessage).toHaveBeenCalledWith({ text: 'Q' })
      expect(chat.usage.value).toBeUndefined()

      capturedInit().onFinish(finished)
      expect(chat.usage.value).toEqual(USAGE)
    })

    it('adds up the finished streams of one question', () => {
      const chat = useAssistantChat(ref(null), () => null)

      chat.sendMessage({ text: 'Q' })
      capturedInit().onFinish(finished)
      capturedInit().onFinish(finished)

      expect(chat.usage.value).toEqual({ inputTokens: 1800, outputTokens: 200, totalTokens: 2000 })
    })

    it('resets the usage on a new question', () => {
      const chat = useAssistantChat(ref(null), () => null)
      chat.sendMessage({ text: 'Q' })
      capturedInit().onFinish(finished)

      chat.sendMessage({ text: 'Q2' })

      expect(chat.usage.value).toBeUndefined()
    })

    it.each([
      ['an error', { message: { metadata: { usage: USAGE } }, isError: true }],
      ['an abort', { message: { metadata: { usage: USAGE } }, isAbort: true }],
      ['a reply without usage', { message: { metadata: { pydantic_ai: {} } }, isAbort: false, isError: false }],
    ])('marks the usage unavailable after %s', (_name, event) => {
      const chat = useAssistantChat(ref(null), () => null)
      chat.sendMessage({ text: 'Q' })

      capturedInit().onFinish(event)
      expect(chat.usage.value).toBeNull()

      // A later good stream of the same question cannot turn a partial total into a total.
      capturedInit().onFinish(finished)
      expect(chat.usage.value).toBeNull()
    })

    it('ignores the finish of a turn cut by a new conversation', () => {
      const chat = useAssistantChat(ref(null), () => null)
      chat.sendMessage({ text: 'Q' })

      chat.newConversation()
      capturedInit().onFinish({ message: { metadata: undefined }, isAbort: true })

      expect(chat.usage.value).toBeUndefined()
    })

    it('ignores a finish received before any question', () => {
      const chat = useAssistantChat(ref(null), () => null)

      capturedInit().onFinish(finished)

      expect(chat.usage.value).toBeUndefined()
    })

    it('forgets the usage when the conversation is renewed', () => {
      const chat = useAssistantChat(ref(null), () => null)
      chat.sendMessage({ text: 'Q' })
      capturedInit().onFinish(finished)

      chat.newConversation()

      expect(chat.usage.value).toBeUndefined()
    })
  })
})

describe('useAssistantModels', () => {
  const MODELS = [
    { id: 'gpt-oss-120b', label: 'GPT-OSS-120B', default: true },
    { id: 'mistral-medium-3-5', label: 'Mistral Medium 3.5', default: false },
  ]

  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'https://api.example' } }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('loads the models with the chat\'s authentication', async () => {
    const fetchMock = vi.fn().mockResolvedValue(MODELS)
    vi.stubGlobal('$fetch', fetchMock)

    const { models } = useAssistantModels()

    expect(fetchMock).toHaveBeenCalledWith('https://api.example/api/1/assistant/models/', { headers: {}, credentials: 'include' })
    expect(models.value).toEqual([])
    await flushPromises()
    expect(models.value).toEqual(MODELS)
  })

  it('has no models when the list cannot be loaded', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('503')))

    const { models } = useAssistantModels()
    await flushPromises()

    expect(models.value).toEqual([])
  })

  it('drops malformed entries', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([MODELS[0], { id: 1 }, null]))

    const { models } = useAssistantModels()
    await flushPromises()

    expect(models.value).toEqual([MODELS[0]])
  })
})
