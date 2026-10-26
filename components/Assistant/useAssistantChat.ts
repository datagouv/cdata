import type { Ref } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'

/**
 * useChat configured for the udata assistant endpoint.
 *
 * The browser talks to udata directly (no nuxt-api proxy), so the transport
 * sends cookies (`credentials: 'include'`) for the session to be authenticated.
 * The selected chart resource id is forwarded as `resource_id` when set;
 * the backend validates it (UUID) and injects the resource context into the
 * conversation.
 */
export function useAssistantChat(resourceId: Ref<string | null>) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string

  return useChat({
    transport: new DefaultChatTransport({
      api: `${apiBase}/api/1/assistant/chat/`,
      credentials: 'include',
      prepareSendMessagesRequest({ messages, id, trigger, messageId }) {
        // Keep the protocol fields (id/trigger/messageId): the backend's
        // VercelAIAdapter discriminates SubmitMessage on `trigger` and
        // requires `id` — dropping them yields a 400 "invalid request body".
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
