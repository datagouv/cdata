import type { Ref } from 'vue'
import { watch } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { buildChatBody, type AssistantVisualization } from '~/utils/assistant'

export function useAssistantChat(resourceId: Ref<string | null>, visualization: () => AssistantVisualization | null) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const assistantApiBase = (runtimeConfig.public.assistantApiBase as string) || apiBase
  const devApiKey = runtimeConfig.public.devApiKey as string | undefined
  const { locale } = useTranslation()

  const chat = useChat({
    // The transport does its own fetch, outside $api: mirror its authentication
    // and lang parameter (plugins/api.ts).
    transport: new DefaultChatTransport({
      api: `${assistantApiBase}/api/1/assistant/chat/?lang=${encodeURIComponent(locale)}`,
      headers: devApiKey ? { 'X-API-KEY': devApiKey } : {},
      credentials: devApiKey ? undefined : 'include',
      prepareSendMessagesRequest({ messages, id, trigger, messageId }) {
        // buildChatBody keeps the protocol fields required by udata's VercelAIAdapter.
        // The chart is read at send time so the assistant sees the user's latest edits.
        return { body: buildChatBody(messages, resourceId.value, visualization(), { id, trigger, messageId }) }
      },
    }),
  })

  // stop() aborts a still-running stream and clearError() drops its error so it
  // cannot be shown on the new, empty history.
  function newConversation() {
    chat.stop()
    chat.messages.value = []
    chat.clearError()
  }

  // History belongs to the selected resource: without a reset, switching
  // resources would resend the previous conversation with the new resource_id.
  watch(resourceId, newConversation)

  return { ...chat, newConversation }
}
