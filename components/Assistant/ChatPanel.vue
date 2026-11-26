<template>
  <section class="flex min-h-0 flex-1 flex-col space-y-4">
    <div
      v-if="!messages.length"
      class="flex min-h-0 flex-1 flex-col overflow-y-auto"
      data-testid="assistant-empty-state"
    >
      <!-- The animation plays once, in under 5 s (RGAA 13.8); the media source keeps it from even downloading under reduced motion. -->
      <picture
        class="mb-3 block size-20 shrink-0 max-sm:size-16"
        aria-hidden="true"
      >
        <source
          media="(prefers-reduced-motion: reduce)"
          :srcset="ASSISTANT_LOGO"
        >
        <img
          :src="ASSISTANT_SIGNATURE"
          alt=""
          width="80"
          height="80"
          class="size-full object-contain mix-blend-multiply"
        >
      </picture>
      <h3 class="m-0 text-[15px] font-semibold leading-snug text-new-gray-dark">
        {{ waiting ? $t('Assistant d’exploration de données') : $t('Assistant de visualisation') }}
      </h3>
      <p
        :id="waiting ? 'assistant-waiting' : undefined"
        class="m-0 mt-1 text-[13px] leading-5 text-new-gray-medium"
      >
        {{ waiting ? $t('Chargez une ressource pour permettre à l’assistant de comprendre sa structure.') : $t('Décrivez le graphique souhaité ou posez une question sur ces données.') }}
      </p>
      <ul
        v-if="!waiting"
        class="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0"
      >
        <li
          v-for="suggestion in suggestions"
          :key="suggestion"
          class="max-w-full p-0"
        >
          <Tag
            class="text-left"
            data-testid="assistant-suggestion"
            @click="applySuggestion(suggestion)"
          >
            {{ suggestion }}
          </Tag>
        </li>
      </ul>
    </div>

    <div
      v-if="messages.length"
      class="flex shrink-0 justify-end"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-new-gray-medium hover:bg-gray-some hover:text-new-gray-dark"
        data-testid="assistant-new-conversation"
        @click="startNewConversation"
      >
        <RiAddLine
          class="size-3.5"
          aria-hidden="true"
        />
        {{ $t('Nouvelle conversation') }}
      </button>
    </div>

    <div
      v-if="messages.length"
      ref="messagesContainerRef"
      role="log"
      aria-live="polite"
      class="flex-1 min-h-0 overflow-y-auto space-y-4"
      @scroll="onMessagesScroll"
    >
      <article
        v-for="message in messages"
        :key="message.id"
        :data-message-role="message.role"
        :class="message.role === 'user'
          ? 'ml-auto flex max-w-[88%] flex-col items-end'
          : undefined"
      >
        <div
          v-if="message.role === 'user'"
          class="whitespace-pre-wrap rounded-md bg-gray-lower px-3 py-2 text-sm"
        >
          {{ userMessageText(message.parts) }}
        </div>
        <template v-else>
          <MarkdownViewer
            v-for="(text, index) in messageDisplay(message).textsAbove"
            :key="`above-${index}`"
            :content="text"
            generated
            class="mb-2"
          />
          <AssistantTimeline
            v-if="message === liveMessage && liveTimeline"
            :timeline="liveTimeline"
            class="mb-2"
          />
          <ReasoningBlock
            v-else-if="messageDisplay(message).reasoning.length"
            :sentences="messageDisplay(message).reasoning"
            class="mb-2"
          />
          <ToolsBlock
            v-if="messageDisplay(message).traces.length"
            :traces="messageDisplay(message).traces"
            :running="message === liveMessage && messageDisplay(message).toolsRunning"
            class="mb-2"
          />
          <MarkdownViewer
            v-for="(text, index) in messageDisplay(message).textsBelow"
            :key="`below-${index}`"
            :content="text"
            generated
          />
        </template>
      </article>
      <!-- Before the SDK creates the assistant message (status submitted). -->
      <AssistantTimeline
        v-if="liveTimeline && !liveMessage"
        :timeline="liveTimeline"
      />
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="text-sm text-new-error m-0"
    >
      {{ errorMessage }}
      <button
        v-if="conversationUnreadable"
        type="button"
        class="ml-1 underline hover:no-underline"
        @click="startNewConversation"
      >
        {{ $t('Commencer une nouvelle conversation') }}
      </button>
    </p>

    <!-- A textarea does not submit on Enter: handleEnter does. -->
    <form
      class="mt-auto shrink-0"
      @submit.prevent="submit"
    >
      <div
        class="overflow-hidden rounded-md border border-gray-default bg-white transition-[border-color,box-shadow] focus-within:border-new-primary focus-within:shadow-[0_0_0_2px_var(--color-blue-light)]"
      >
        <div
          v-if="resource"
          role="group"
          :aria-label="$t('Contexte utilisé par l’assistant')"
          class="border-b border-gray-default px-2 pt-1.5 pb-2"
        >
          <p
            class="m-0 text-[11px] leading-5 text-new-gray-medium"
            aria-hidden="true"
          >
            {{ $t('Contexte utilisé par l’assistant') }}
          </p>
          <ul class="m-0 mt-1 flex min-w-0 list-none flex-wrap gap-1.5 p-0">
            <li class="min-w-0 max-w-full">
              <Tag
                :icon="RiTableLine"
                :title="resource.title"
              >
                <span class="flex min-w-0 gap-1.5">
                  <span class="truncate">{{ resource.title }}</span>
                  <span
                    v-if="resource.format"
                    class="shrink-0 uppercase"
                  ><span class="sr-only">{{ $t('format') }} </span>{{ resource.format }}</span>
                </span>
              </Tag>
            </li>
            <li
              v-if="visualization"
              class="shrink-0"
            >
              <Tag :icon="RiFocus3Line">
                {{ $t('Visualisation en cours') }}
              </Tag>
            </li>
          </ul>
        </div>
        <div class="flex h-28 flex-col px-2 py-2">
          <textarea
            id="assistant-input"
            ref="textareaRef"
            v-model="input"
            rows="3"
            :maxlength="MAX_INPUT_LENGTH"
            class="min-h-0 w-full flex-1 resize-none border-0 bg-transparent text-[11px] leading-5 text-new-gray-dark outline-none placeholder:text-gray-medium"
            :aria-label="$t('Votre demande')"
            :aria-describedby="input.length >= COUNTER_THRESHOLD ? 'assistant-input-counter' : undefined"
            :disabled="waiting || busy"
            :placeholder="$t('Décrivez le graphique souhaité…')"
            @keydown.enter="handleEnter"
          />
          <footer class="flex items-center justify-end gap-2">
            <!-- Read with the field it describes. -->
            <span
              v-if="input.length >= COUNTER_THRESHOLD"
              id="assistant-input-counter"
              class="mr-auto text-[11px] tabular-nums"
              :class="input.length >= MAX_INPUT_LENGTH ? 'text-new-error' : 'text-new-gray-medium'"
            >{{ input.length.toLocaleString(locale) }} / {{ MAX_INPUT_LENGTH.toLocaleString(locale) }}<span class="sr-only"> {{ $t('caractères') }}</span></span>
            <!-- RGAA 7.5: announced when a threshold is first crossed, not on every keystroke. -->
            <span
              class="sr-only"
              role="status"
              data-testid="chat-length-status"
            >{{ lengthNotice }}</span>
            <button
              v-if="busy"
              type="button"
              class="flex h-7 shrink-0 items-center gap-1 rounded-md border border-new-gray-dark px-2 text-xs font-medium text-new-gray-dark hover:bg-gray-100"
              @click="stopTurn"
            >
              <RiStopMiniLine
                class="size-4"
                aria-hidden="true"
              />
              {{ $t('Arrêter') }}
            </button>
            <button
              v-else
              type="submit"
              :aria-label="$t('Envoyer')"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-new-primary text-white hover:bg-new-primary-hover disabled:cursor-not-allowed disabled:bg-new-gray-medium-clic"
              :disabled="waiting || !input.trim()"
            >
              <RiArrowUpLine
                class="size-4"
                aria-hidden="true"
              />
            </button>
          </footer>
        </div>
      </div>
      <p class="m-0 mt-1 text-right text-[11px] leading-5 text-new-gray-medium">
        {{ $t('L’assistant peut faire des erreurs.') }}
        <a
          :href="config.public.guidesAssistantMistakes"
          target="_blank"
          rel="noopener"
        >{{ $t('En savoir plus') }}</a>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { RiAddLine, RiArrowUpLine, RiFocus3Line, RiStopMiniLine, RiTableLine } from '@remixicon/vue'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { MarkdownViewer, Tag, useTranslation, type ColumnDefinition } from '@datagouv/components-next'
import AssistantTimeline from './AssistantTimeline.vue'
import ReasoningBlock from './ReasoningBlock.vue'
import ToolsBlock from './ToolsBlock.vue'
import { useAssistantChat } from './useAssistantChat'
import { chartToolResults, isNearChatBottom } from '~/utils/assistant'
import { useAssistantErrorMessage } from './useAssistantErrorMessage'
import { useMessageDisplay, type ChatMessageDisplay } from './useMessageDisplay'
import { useStarterQuestions } from './useStarterQuestions'
import { useTurnTimeline } from './useTurnTimeline'
import type { AssistantVisualization, ChartToolResult } from '~/utils/assistant'

const props = defineProps<{
  resourceId: string | null
  /** Sent with each message when not null: the context block mentions it. */
  visualization: AssistantVisualization | null
  columns: Array<ColumnDefinition>
  resource: { title: string, format: string | null } | null
}>()

const emit = defineEmits<{
  (e: 'chart-result', result: ChartToolResult): void
}>()

const config = useRuntimeConfig()
const { error, messages, newConversation, sendMessage, status, stop } = useAssistantChat(toRef(props, 'resourceId'), () => props.visualization)

// Bound, not literal: the asset stays a plain public URL instead of being inlined by the build.
const ASSISTANT_LOGO = '/nuxt_images/assistant/assistant-logo.svg'
const ASSISTANT_SIGNATURE = '/nuxt_images/assistant/assistant-signature.webp'

const MAX_INPUT_LENGTH = 4000
const COUNTER_THRESHOLD = 3600

const input = ref('')
// 0 below the counter threshold, 1 past it, 2 at the limit.
const lengthLevel = computed(() => input.value.length >= MAX_INPUT_LENGTH ? 2 : input.value.length >= COUNTER_THRESHOLD ? 1 : 0)
// Changed only when a higher level is reached: editing at the limit would otherwise
// announce the two notices in turn.
const lengthNotice = ref('')
let announcedLevel = 0
watch(lengthLevel, (level) => {
  const max = MAX_INPUT_LENGTH.toLocaleString(locale)
  if (level === 0) {
    announcedLevel = 0
    lengthNotice.value = ''
  }
  else if (level > announcedLevel) {
    announcedLevel = level
    lengthNotice.value = level === 2
      ? t('Limite de {max} caractères atteinte.', { max })
      : t('Votre demande approche de la limite de {max} caractères.', { max })
  }
})
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messagesContainerRef = ref<HTMLElement | null>(null)
// Latched on each scroll event: the user keeps the auto-scroll only while
// they stay near the bottom, so reading history is never interrupted.
const nearBottom = ref(true)

function onMessagesScroll() {
  const el = messagesContainerRef.value
  if (el) nearBottom.value = isNearChatBottom(el)
}

async function scrollMessagesToBottom() {
  await nextTick()
  const el = messagesContainerRef.value
  if (el) el.scrollTop = el.scrollHeight
}

// useChat publishes a new array on each chunk, with a new object for each
// changed message only: no deep watch, and finished messages are skipped.
watch(messages, () => {
  if (nearBottom.value) scrollMessagesToBottom()
})

type ChatMessage = (typeof messages.value)[number]

const buildMessageDisplay = useMessageDisplay()
const messageDisplayCache = new WeakMap<ChatMessage, ChatMessageDisplay>()

function messageDisplay(message: ChatMessage): ChatMessageDisplay {
  let display = messageDisplayCache.get(message)
  if (!display) {
    display = buildMessageDisplay(message.parts)
    messageDisplayCache.set(message, display)
  }
  return display
}

const buildTimeline = useTurnTimeline()

// Each update lists every chart of the conversation again: one already applied must not undo the user's form changes since.
const emittedToolCalls = new Set<string>()

watch(messages, (value) => {
  if (!value.length) emittedToolCalls.clear()
  for (const result of chartToolResults(value)) {
    if (emittedToolCalls.has(result.toolCallId)) continue
    emittedToolCalls.add(result.toolCallId)
    emit('chart-result', result)
  }
})

const waiting = computed(() => !props.resourceId)
// 'error' is not busy: a failed request leaves the status on 'error' until the
// next one starts, and the composer must stay usable so the user can retry.
const busy = computed(() => status.value === 'submitted' || status.value === 'streaming')
const assistantErrorMessage = useAssistantErrorMessage()
const errorMessage = computed(() => (error.value ? assistantErrorMessage(error.value) : null))
const conversationUnreadable = computed(() => (error.value as { statusCode?: unknown } | undefined)?.statusCode === 409)
// The message the turn is being written in, once the SDK has created it.
const liveMessage = computed(() => {
  const last = messages.value.at(-1)
  return busy.value && last?.role === 'assistant' ? last : null
})
const liveTimeline = computed(() => (busy.value ? buildTimeline(liveMessage.value?.parts ?? []) : null))

// User input is plain text, not markdown: render it as-is.
function userMessageText(parts: Array<{ type: string, text?: unknown }>): string {
  return parts.map(part => (part.type === 'text' && typeof part.text === 'string' ? part.text : '')).filter(Boolean).join('\n')
}

const { t, locale } = useTranslation()
const suggestions = useStarterQuestions(() => props.columns)

// The button that started it leaves the DOM with the conversation (RGAA 12.8).
async function startNewConversation() {
  newConversation()
  await nextTick()
  textareaRef.value?.focus()
}

// A suggestion only fills the composer: the user reviews it before sending.
function applySuggestion(suggestion: string) {
  input.value = suggestion
  textareaRef.value?.focus()
}

// A double click or a repeated Enter finds the composer already emptied.
function submit() {
  const text = input.value.trim()
  if (!text || waiting.value || busy.value) return
  lastSentText = text
  sendMessage({ text })
  input.value = ''
}

// Text of the in-flight request, restored in the composer if it fails so a
// network error never loses the user's message.
let lastSentText: string | null = null

// udata does not keep a failed or stopped turn: the screen must not show it either.
function dropLastTurn(text: string) {
  const lastTurn = messages.value.findLastIndex(message => message.role === 'user')
  if (lastTurn !== -1) messages.value = messages.value.slice(0, lastTurn)
  input.value = text
}

// The status cannot tell a stopped turn from a finished one: stopping drops it here.
async function stopTurn() {
  const text = lastSentText
  lastSentText = null
  await stop()
  if (text !== null) dropLastTurn(text)
}

// The composer stays disabled for the whole request, so give the focus back
// once the status settles (error included, to make retrying immediate).
watch(status, async (value) => {
  if (value !== 'ready' && value !== 'error') return
  if (value === 'error' && lastSentText !== null) dropLastTurn(lastSentText)
  lastSentText = null
  await nextTick()
  textareaRef.value?.focus()
})

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey || event.isComposing) return
  event.preventDefault()
  submit()
}
</script>
