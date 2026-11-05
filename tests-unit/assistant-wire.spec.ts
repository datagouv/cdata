// @vitest-environment happy-dom
// Pins the real wire contract of useAssistantChat without stubbing it: @ai-sdk/vue's
// useChat is mocked to capture its init, and the transport built by the composable is
// exercised directly (api URL, credentials, prepared request body).
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
  credentials: RequestCredentials
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('targets the assistant chat endpoint with credentials included', () => {
    useAssistantChat(ref(null))
    const transport = capturedTransport()

    expect(transport.api).toBe('https://api.example/api/1/assistant/chat/')
    expect(transport.credentials).toBe('include')
  })

  it('uses the configured assistant API base when provided', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        apiBase: 'https://api.example',
        assistantApiBase: 'https://assistant.example',
      },
    }))

    useAssistantChat(ref(null))

    expect(capturedTransport().api).toBe('https://assistant.example/api/1/assistant/chat/')
  })

  it('clears the message history when the selected resource changes', async () => {
    const resourceId = ref<string | null>('resource-1')
    const chat = useAssistantChat(resourceId)

    chat.messages.value = [...MESSAGES] as typeof chat.messages.value
    resourceId.value = 'resource-2'
    await nextTick()

    expect(chat.messages.value).toEqual([])
    expect(chat.stop).toHaveBeenCalled()
    expect(chat.clearError).toHaveBeenCalled()
  })

  it('sends resource_id only when a resource is selected', async () => {
    const resourceId = ref<string | null>('f47ac10b-58cc-4372-a567-0e02b2c3d479')
    useAssistantChat(resourceId)
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
})
