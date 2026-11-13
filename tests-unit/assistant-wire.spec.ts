// @vitest-environment happy-dom
// Pins the real wire contract of useAssistantChat without stubbing it: @ai-sdk/vue's
// useChat is mocked to capture its init, and the transport built by the composable is
// exercised directly (api URL, authentication, prepared request body).
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChat } from '@ai-sdk/vue'
import { useAssistantChat } from '~/components/Assistant/useAssistantChat'

vi.mock('@ai-sdk/vue', () => ({
  useChat: vi.fn(() => ({ messages: ref([]), stop: vi.fn(), clearError: vi.fn() })),
}))

const MESSAGES = [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Bonjour' }] }]

type TransportInit = {
  api: string
  credentials: RequestCredentials | undefined
  headers: Record<string, string> | undefined
  prepareSendMessagesRequest: (options: { messages: unknown[], id: string, trigger: 'submit-message', messageId: string | undefined }) => Promise<{ body: unknown }> | { body: unknown }
}

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

  it('uses the configured assistant API base when provided', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        apiBase: 'https://api.example',
        assistantApiBase: 'https://assistant.example',
      },
    }))

    useAssistantChat(ref(null), () => null)

    expect(capturedTransport().api).toBe('https://assistant.example/api/1/assistant/chat/?lang=fr')
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

  it('sends resource_id only when a resource is selected', async () => {
    const resourceId = ref<string | null>('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    useAssistantChat(resourceId, () => null)
    const transport = capturedTransport()

    const withResource = await transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })
    // Protocol fields (id/trigger/messageId) are required by the backend's
    // VercelAIAdapter (SubmitMessage discriminated union) and must not be dropped.
    expect(withResource.body).toEqual({ id: 'chat-1', trigger: 'submit-message', messageId: undefined, messages: MESSAGES, resource_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })

    resourceId.value = null
    const withoutResource = await transport.prepareSendMessagesRequest({ messages: MESSAGES, id: 'chat-1', trigger: 'submit-message' as const, messageId: undefined })
    expect(withoutResource.body).toEqual({ id: 'chat-1', trigger: 'submit-message', messageId: undefined, messages: MESSAGES })
    expect(withoutResource.body).not.toHaveProperty('resource_id')
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
})
