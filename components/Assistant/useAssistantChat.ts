import type { Ref } from 'vue'
import { watch } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { buildChatBody } from '~/utils/assistant'

export function useAssistantChat(resourceId: Ref<string | null>) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const assistantApiBase = (runtimeConfig.public.assistantApiBase as string) || apiBase

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: `${assistantApiBase}/api/1/assistant/chat/`,
      credentials: 'include',
      prepareSendMessagesRequest({ messages, id, trigger, messageId }) {
        // buildChatBody keeps the protocol fields required by udata's VercelAIAdapter.
        return { body: buildChatBody(messages, resourceId.value, { id, trigger, messageId }) }
      },
    }),
  })

  // History belongs to the selected resource: without a reset, switching
  // resources would resend the previous conversation with the new resource_id.
  // stop() aborts a still-running stream of the previous resource and
  // clearError() drops its error so it cannot be shown on the new history.
  watch(resourceId, () => {
    chat.stop()
    chat.messages.value = []
    chat.clearError()
  })

  return chat
}
