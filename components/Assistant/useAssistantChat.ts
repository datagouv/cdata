import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import './zodJitless'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport, generateId } from 'ai'
import { addUsage, messageUsage } from '~/utils/assistant'
import type { AssistantVisualization, TokenUsage } from '~/utils/assistant'
import { apiAuthOptions } from '~/utils/auth'

export function useAssistantChat(resourceId: Ref<string | null>, visualization: () => AssistantVisualization | null) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const { locale } = useTranslation()

  // udata stores the conversation under this id: useChat keeps its own after a reset.
  let conversationId = generateId()

  // null: the server's default model.
  const modelId = ref<string | null>(null)
  // undefined: no stream finished since the question; null: unavailable.
  const usage = ref<TokenUsage | null | undefined>(undefined)
  // Not reactive: set synchronously, so the late onFinish of a stopped turn is told from a live one.
  let awaitingUsage = false

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
            model: modelId.value,
          },
        }
      },
    }),
    // Also called after an error or a stop(): the usage is then unknown, never partial.
    onFinish({ message, isAbort, isError }) {
      if (!awaitingUsage) return
      const finished = isAbort || isError ? null : messageUsage(message.metadata)
      usage.value = finished && usage.value !== null ? addUsage(usage.value, finished) : null
    },
  })

  function sendMessage(...args: Parameters<typeof chat.sendMessage>) {
    awaitingUsage = true
    usage.value = undefined
    return chat.sendMessage(...args)
  }

  // stop() aborts a still-running stream and clearError() drops its error so it
  // cannot be shown on the new, empty history.
  function newConversation() {
    chat.stop()
    chat.messages.value = []
    chat.clearError()
    conversationId = generateId()
    awaitingUsage = false
    usage.value = undefined
  }

  // A conversation is stored under one model: another model means another conversation.
  function selectModel(id: string) {
    modelId.value = id
    newConversation()
  }

  // History belongs to the selected resource: without a reset, switching
  // resources would continue the previous conversation with the new resource_id.
  watch(resourceId, newConversation)

  return { ...chat, sendMessage, newConversation, modelId: readonly(modelId), selectModel, usage: readonly(usage) }
}
