import type { Ref } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { buildChatBody } from '~/utils/assistant'

/**
 * useChat configured for the udata assistant endpoint.
 *
 * The browser talks to udata directly (no nuxt-api proxy), so the transport
 * sends cookies (`credentials: 'include'`) for the session to be authenticated.
 * The selected chart resource id is forwarded as `resource_id` when the
 * runtimeConfig feature flag allows it and a resource is selected.
 */
export function useAssistantChat(resourceId: Ref<string | null>) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const sendResourceContext = runtimeConfig.public.features?.assistantResourceContext ?? true

  return useChat({
    transport: new DefaultChatTransport({
      api: `${apiBase}/api/1/assistant/chat/`,
      credentials: 'include',
      prepareSendMessagesRequest({ messages }) {
        return {
          body: buildChatBody(messages, sendResourceContext ? resourceId.value : null),
        }
      },
    }),
  })
}
