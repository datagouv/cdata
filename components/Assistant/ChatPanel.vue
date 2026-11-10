<template>
  <section class="flex min-h-0 flex-1 flex-col space-y-4">
    <div
      v-if="!messages.length"
      class="flex min-h-0 flex-1 flex-col overflow-y-auto"
      data-testid="assistant-empty-state"
    >
      <!-- The media source keeps the animation from even downloading under reduced motion. -->
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
        v-if="waiting"
        id="assistant-waiting"
        class="m-0 mt-1 text-[13px] leading-5 text-new-gray-medium"
      >
        {{ $t('Chargez une ressource pour permettre à l’assistant de comprendre sa structure.') }}
      </p>
      <p
        v-else
        class="m-0 mt-1 text-[13px] leading-5 text-new-gray-medium"
      >
        {{ $t('Décrivez le graphique souhaité ou posez une question sur ces données.') }}
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
          <button
            type="button"
            class="inline-flex min-h-7 max-w-full items-center rounded-full border border-gray-default bg-white px-2.5 py-1 text-left text-xs leading-snug text-new-gray-medium transition-colors hover:border-new-primary hover:bg-blue-light hover:text-new-primary motion-reduce:transition-none"
            data-testid="assistant-suggestion"
            @click="applySuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
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
        @click="newConversation"
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
        <template
          v-for="(item, index) in displayItems(message)"
          v-else
          :key="index"
        >
          <ToolTrace
            v-if="item.kind === 'trace'"
            :trace="item.trace"
            class="mb-2"
          />
          <ThinkingBlock
            v-else-if="item.kind === 'thinking'"
            :text="item.text"
            class="mb-2"
          />
          <MarkdownViewer
            v-else-if="item.kind === 'text'"
            :content="item.text"
            no-images
          />
        </template>
      </article>
      <AssistantThinking
        v-if="busy"
        :responding="replyStarted"
      />
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="text-sm text-red-600 m-0"
    >
      {{ $t(errorMessage) }}
      <button
        v-if="conversationTooLarge"
        type="button"
        class="ml-1 underline hover:no-underline"
        @click="newConversation"
      >
        {{ $t('Commencer une nouvelle conversation') }}
      </button>
    </p>

    <!-- A div, not a form: this panel lives inside the chart configurator's root
    form and nested forms are invalid HTML. Enter submits via handleEnter. -->
    <div class="mt-auto shrink-0">
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
            <li
              class="inline-flex h-7 min-w-0 max-w-full items-center gap-1.5 rounded border border-blue-tint bg-blue-light px-2 py-0 text-new-primary"
              :title="resource.title"
            >
              <RiTableLine
                class="size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span class="truncate text-xs font-medium">{{ resource.title }}</span>
              <span
                v-if="resource.format"
                class="shrink-0 border-l border-blue-tint pl-1.5 text-[11px] uppercase"
              ><span class="sr-only">{{ $t('format') }} </span>{{ resource.format }}</span>
            </li>
            <li
              v-if="visualization"
              class="inline-flex h-7 shrink-0 items-center gap-1.5 rounded border border-blue-tint bg-white px-2 py-0 text-new-primary"
            >
              <RiFocus3Line
                class="size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span class="text-xs font-medium">{{ $t('Visualisation en cours') }}</span>
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
            class="min-h-0 w-full flex-1 resize-none border-0 bg-transparent text-[11px] leading-5 text-new-gray-dark outline-none placeholder:text-new-gray-medium-clic"
            :aria-label="$t('Votre demande')"
            :disabled="waiting || busy"
            :placeholder="$t('Décrivez le graphique souhaité…')"
            @keydown.enter="handleEnter"
          />
          <footer class="flex items-center justify-end gap-2">
            <span
              v-if="input.length >= COUNTER_THRESHOLD"
              class="mr-auto text-[11px] tabular-nums"
              :class="input.length >= MAX_INPUT_LENGTH ? 'text-new-error' : 'text-new-gray-medium'"
            >{{ input.length.toLocaleString('fr-FR') }} / {{ MAX_INPUT_LENGTH.toLocaleString('fr-FR') }}</span>
            <button
              v-if="busy"
              type="button"
              class="flex h-7 shrink-0 items-center gap-1 rounded-md border border-new-gray-dark px-2 text-xs font-medium text-new-gray-dark hover:bg-gray-100"
              @click="stop"
            >
              <RiStopMiniLine
                class="size-4"
                aria-hidden="true"
              />
              {{ $t('Arrêter') }}
            </button>
            <button
              v-else
              type="button"
              :aria-label="$t('Envoyer')"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-new-primary text-white hover:bg-new-primary-hover disabled:cursor-not-allowed disabled:bg-new-gray-medium-clic"
              :disabled="waiting || !input.trim()"
              @click="submit"
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
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RiAddLine, RiArrowUpLine, RiFocus3Line, RiStopMiniLine, RiTableLine } from '@remixicon/vue'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { MarkdownViewer, useTranslation, type ColumnDefinition } from '@datagouv/components-next'
import ToolTrace from './ToolTrace.vue'
import AssistantThinking from './AssistantThinking.vue'
import ThinkingBlock from './ThinkingBlock.vue'
import { useAssistantChat } from './useAssistantChat'
import { buildChatDisplayItems, chartToolResults, getStarterQuestions, isNearChatBottom, mapAssistantError } from '~/utils/assistant'
import type { AssistantVisualization, ChatDisplayItem, ChartToolResult } from '~/utils/assistant'

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

const { error, messages, newConversation, sendMessage, status, stop } = useAssistantChat(toRef(props, 'resourceId'), () => props.visualization)

// Bound, not literal: the asset stays a plain public URL instead of being inlined by the build.
const ASSISTANT_LOGO = '/nuxt_images/assistant/assistant-logo.svg'
const ASSISTANT_SIGNATURE = '/nuxt_images/assistant/assistant-signature.webp'

const MAX_INPUT_LENGTH = 4000
const COUNTER_THRESHOLD = 3600

const input = ref('')
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

const displayItemsCache = new WeakMap<ChatMessage, Array<ChatDisplayItem>>()

function displayItems(message: ChatMessage): Array<ChatDisplayItem> {
  let items = displayItemsCache.get(message)
  if (!items) {
    items = buildChatDisplayItems(message.parts)
    displayItemsCache.set(message, items)
  }
  return items
}

// The configurator ignores a tool call it already applied: emitting the
// results of every changed message is enough.
const scannedMessages = new WeakSet<ChatMessage>()

watch(messages, (value) => {
  for (const message of value) {
    if (scannedMessages.has(message)) continue
    scannedMessages.add(message)
    for (const result of chartToolResults([message])) emit('chart-result', result)
  }
})

// First paint of the conversation also scrolls (messages go from none to some).
nearBottom.value = true
scrollMessagesToBottom()

const waiting = computed(() => !props.resourceId)
// 'error' is not busy: a failed request leaves the status on 'error' until the
// next one starts, and the composer must stay usable so the user can retry.
const busy = computed(() => status.value === 'submitted' || status.value === 'streaming')
const errorMessage = computed(() => (error.value ? mapAssistantError(error.value) : null))
const conversationTooLarge = computed(() => (error.value as { statusCode?: unknown } | undefined)?.statusCode === 413)
const replyStarted = computed(() => {
  const last = messages.value.at(-1)
  return last?.role === 'assistant' && displayItems(last).length > 0
})

// User input is plain text, not markdown: render it as-is.
function userMessageText(parts: Array<{ type: string, text?: unknown }>): string {
  return parts.map(part => (part.type === 'text' && typeof part.text === 'string' ? part.text : '')).filter(Boolean).join('\n')
}

const { t } = useTranslation()
const suggestions = computed(() => getStarterQuestions(props.columns, t))

// A suggestion only fills the composer: the user reviews it before sending.
function applySuggestion(suggestion: string) {
  input.value = suggestion
  textareaRef.value?.focus()
}

// Guard against double submissions (double click, repeated Enter).
const SEND_COOLDOWN_MS = 1000
let lastSubmittedAt = 0

function submit() {
  const text = input.value.trim()
  const now = Date.now()
  if (!text || waiting.value || busy.value || now - lastSubmittedAt < SEND_COOLDOWN_MS) return
  lastSubmittedAt = now
  lastSentText = text
  sendMessage({ text })
  input.value = ''
}

// Text of the in-flight request, restored in the composer if it fails so a
// network error never loses the user's message.
let lastSentText: string | null = null

// The composer stays disabled for the whole request, so give the focus back
// once the status settles (error included, to make retrying immediate).
watch(status, async (value) => {
  if (value !== 'ready' && value !== 'error') return
  if (value === 'error' && lastSentText !== null) {
    // useChat keeps the failed user message (and any partial reply): drop that
    // turn, or resending the restored text would show and send it twice.
    const failedTurn = messages.value.findLastIndex(message => message.role === 'user')
    if (failedTurn !== -1) messages.value = messages.value.slice(0, failedTurn)
    input.value = lastSentText
    lastSentText = null
  }
  await nextTick()
  textareaRef.value?.focus()
})

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey || event.isComposing) return
  event.preventDefault()
  submit()
}
</script>
