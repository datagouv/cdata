<template>
  <section class="flex flex-col h-full space-y-4">
    <h3 class="font-bold text-lg m-0">
      {{ $t('Assistant') }}
    </h3>

    <p
      v-if="waiting"
      id="assistant-waiting"
      class="text-new-gray-medium text-sm m-0"
    >
      {{ $t('Sélectionnez une ressource pour discuter avec l’assistant.') }}
    </p>

    <div
      v-if="messages.length"
      class="flex-1 min-h-0 overflow-y-auto space-y-4"
    >
      <article
        v-for="message in messages"
        :key="message.id"
      >
        <template
          v-for="(item, index) in buildChatDisplayItems(message.parts)"
          :key="index"
        >
          <ToolTrace
            v-if="item.kind === 'trace'"
            :trace="item.trace"
            class="mb-2"
          />
          <p
            v-else
            class="whitespace-pre-wrap m-0"
            :class="message.role === 'user' ? 'font-medium' : ''"
          >
            {{ item.text }}
          </p>
        </template>
      </article>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="text-sm text-red-600 m-0"
    >
      {{ $t(errorMessage) }}
    </p>

    <div
      v-if="lastSql && !waiting"
      class="flex flex-wrap gap-2"
    >
      <button
        type="button"
        class="fr-btn fr-btn--sm"
        @click="useQuery"
      >
        {{ $t('Utiliser cette requête') }}
      </button>
      <button
        type="button"
        class="fr-btn fr-btn--sm fr-btn--secondary flex items-center gap-1"
        :title="$t('Copier la requête')"
        @click="copyQuery"
      >
        <RiCheckLine
          v-if="copied"
          class="size-4"
          aria-hidden="true"
        />
        <RiFileCopyLine
          v-else
          class="size-4"
          aria-hidden="true"
        />
        {{ copied ? $t('Copié !') : $t('Copier') }}
      </button>
    </div>

    <!-- A div, not a form: this panel lives inside the chart configurator's root
    form and nested forms are invalid HTML. Enter submits via handleEnter. -->
    <div
      class="mt-auto overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] focus-within:border-new-primary focus-within:shadow-[0_0_0_1px_var(--color-new-primary)]"
    >
      <div class="flex h-28 flex-col px-2 py-2">
        <textarea
          id="assistant-input"
          ref="textareaRef"
          v-model="input"
          rows="3"
          :maxlength="MAX_INPUT_LENGTH"
          class="min-h-0 w-full flex-1 resize-none border-0 bg-transparent text-sm outline-none placeholder:text-new-gray-medium"
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
  </section>
</template>

<script setup lang="ts">
import { RiArrowUpLine, RiCheckLine, RiFileCopyLine, RiStopMiniLine } from '@remixicon/vue'
import { computed, nextTick, ref, toRef, watch } from 'vue'
import ToolTrace from './ToolTrace.vue'
import { useAssistantChat } from './useAssistantChat'
import { buildChatDisplayItems, extractLastSqlBlock, mapAssistantError } from '~/utils/assistant'

const props = defineProps<{
  resourceId: string | null
}>()

const emit = defineEmits<{
  (e: 'use-query', query: string): void
}>()

const { error, messages, sendMessage, status, stop } = useAssistantChat(toRef(props, 'resourceId'))

const MAX_INPUT_LENGTH = 4000
const COUNTER_THRESHOLD = 3600

const input = ref('')
const copied = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const waiting = computed(() => !props.resourceId)
// 'error' is not busy: a failed request leaves the status on 'error' until the
// next one starts, and the composer must stay usable so the user can retry.
const busy = computed(() => status.value === 'submitted' || status.value === 'streaming')
const errorMessage = computed(() => (error.value ? mapAssistantError(error.value) : null))

const lastAssistantText = computed(() => {
  const last = [...messages.value].reverse().find(message => message.role === 'assistant')
  if (!last) return null
  return last.parts.map(part => (part.type === 'text' ? part.text : '')).filter(Boolean).join('\n') || null
})
const lastSql = computed(() => (lastAssistantText.value ? extractLastSqlBlock(lastAssistantText.value) : null))

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

function useQuery() {
  if (lastSql.value) emit('use-query', lastSql.value)
}

async function copyQuery() {
  if (!lastSql.value) return
  try {
    await navigator.clipboard.writeText(lastSql.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // Clipboard unavailable (permissions, non-secure context): no feedback, no
    // unhandled rejection — the user can still use the use-query button.
  }
}
</script>
