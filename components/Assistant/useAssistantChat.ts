import type { Ref } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'

export function useAssistantChat(resourceId: Ref<string | null>) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const assistantApiBase = (runtimeConfig.public.assistantApiBase as string) || apiBase

  return useChat({
    transport: new DefaultChatTransport({
      api: `${assistantApiBase}/api/1/assistant/chat/`,
      credentials: 'include',
      prepareSendMessagesRequest({ messages, id, trigger, messageId }) {
        // Preserve the protocol fields required by udata's VercelAIAdapter.
        return {
          body: {
            id,
            trigger,
            messageId,
            messages,
            ...(resourceId.value ? { resource_id: resourceId.value } : {}),
          },
        }
      },
    }),
  })
}
