import type { Ref } from 'vue'
import { watch } from 'vue'
import './zodJitless'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport, generateId } from 'ai'
import type { AssistantVisualization } from '~/utils/assistant'
import { apiAuthOptions } from '~/utils/auth'

export function useAssistantChat(resourceId: Ref<string | null>, visualization: () => AssistantVisualization | null) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const { locale } = useTranslation()

  // udata stores the conversation under this id: useChat keeps its own after a reset.
  let conversationId = generateId()

  const chat = useChat({
    // The transport does its own fetch, outside $api: mirror its authentication
    // and lang parameter (plugins/api.ts).
    transport: new DefaultChatTransport({
      api: `${apiBase}/api/1/assistant/chat/?lang=${encodeURIComponent(locale)}`,
      ...apiAuthOptions(runtimeConfig.public.devApiKey as string | undefined),
      prepareSendMessagesRequest({ messages, trigger, messageId }) {
        // udata holds the history: only the new question goes, with the chart as it is now.
        return {
          body: {
            id: conversationId,
            trigger,
            messageId,
            messages: messages.slice(-1),
            resource_id: resourceId.value,
            visualization: visualization(),
          },
        }
      },
    }),
  })

  // stop() aborts a still-running stream and clearError() drops its error so it
  // cannot be shown on the new, empty history.
  function newConversation() {
    chat.stop()
    chat.messages.value = []
    chat.clearError()
    conversationId = generateId()
  }

  // History belongs to the selected resource: without a reset, switching
  // resources would continue the previous conversation with the new resource_id.
  watch(resourceId, newConversation)

  return { ...chat, newConversation }
}
