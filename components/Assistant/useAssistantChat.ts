import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import './zodJitless'
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport, generateId } from 'ai'
import { errorStatusCode } from './useAssistantErrorMessage'
import { messageUsage } from '~/utils/assistant'
import type { AssistantTokenUsage, AssistantVisualization } from '~/utils/assistant'
import { apiAuthOptions } from '~/utils/auth'

export function useAssistantChat(resourceId: Ref<string | null>, visualization: () => AssistantVisualization | null) {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase as string
  const { locale } = useTranslation()

  // udata stores the conversation under this id: useChat keeps its own after a reset.
  let conversationId = generateId()

  // null: udata answers with the conversation's model, or its default one for a new conversation.
  const modelId = ref<string | null>(null)
  // null: unavailable, or the question is still being answered.
  const usage = ref<AssistantTokenUsage | null>(null)
  // Not reactive: set synchronously, so the late onFinish of a stopped turn is told from a live one.
  let awaitingUsage = false
  let usageBefore: AssistantTokenUsage | null = null
  let refused = false

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
    onError(error) {
      refused = errorStatusCode(error) !== undefined
    },
    // Also called after an error or a stop(): the usage is then unknown, never partial.
    onFinish({ message, isAbort, isError }) {
      if (!awaitingUsage) return
      // A refused request cost nothing and its turn is dropped: the counter stays on the previous one.
      if (isError && refused) usage.value = usageBefore
      else usage.value = isAbort || isError ? null : messageUsage(message.metadata)
    },
  })

  function sendMessage(...args: Parameters<typeof chat.sendMessage>) {
    awaitingUsage = true
    refused = false
    usageBefore = usage.value
    usage.value = null
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
    usage.value = null
  }

  // A conversation is stored under one model: another model means another conversation.
  function selectModel(id: string) {
    modelId.value = id
    newConversation()
  }

  function resetModel() {
    modelId.value = null
  }

  // History belongs to the selected resource: without a reset, switching
  // resources would continue the previous conversation with the new resource_id.
  watch(resourceId, newConversation)

  return { ...chat, sendMessage, newConversation, modelId: readonly(modelId), selectModel, resetModel, usage: readonly(usage) }
}
