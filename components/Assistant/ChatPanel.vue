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
      class="flex-1 overflow-y-auto space-y-4"
    >
      <article
        v-for="message in messages"
        :key="message.id"
      >
        <template
          v-for="(part, index) in message.parts"
          :key="index"
        >
          <details
            v-if="part.type.startsWith('tool-')"
            class="tool-trace border border-new-gray-light rounded-md mb-2"
          >
            <summary class="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer">
              <RiWrenchLine
                class="size-4 shrink-0 text-new-gray-medium"
                aria-hidden="true"
              />
              <span class="font-mono text-xs">{{ part.type }}</span>
            </summary>
            <pre class="m-0 px-2 pb-2 text-xs overflow-x-auto">{{ JSON.stringify(part, null, 2) }}</pre>
          </details>
          <p
            v-else-if="part.type === 'text'"
            class="whitespace-pre-wrap m-0"
            :class="message.role === 'user' ? 'font-medium' : ''"
          >
            {{ part.text }}
          </p>
        </template>
      </article>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="text-sm text-red-600 m-0"
    >
      {{ errorMessage }}
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

    <form
      class="mt-auto space-y-2"
      @submit.prevent="submit"
    >
      <label
        for="assistant-input"
        class="fr-label"
      >{{ $t('Votre demande') }}</label>
      <textarea
        id="assistant-input"
        v-model="input"
        class="w-full fr-input"
        rows="3"
        :disabled="waiting || busy"
        :placeholder="$t('Décrivez le graphique souhaité…')"
      />
      <button
        type="submit"
        class="fr-btn"
        :disabled="waiting || busy || !input.trim()"
      >
        {{ $t('Envoyer') }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { RiCheckLine, RiFileCopyLine, RiWrenchLine } from '@remixicon/vue'
import { computed, ref, toRef } from 'vue'
import { useAssistantChat } from './useAssistantChat'
import { extractLastSqlBlock, mapAssistantError } from '~/utils/assistant'

const props = defineProps<{
  resourceId: string | null
}>()

const emit = defineEmits<{
  (e: 'use-query', query: string): void
}>()

const { error, messages, sendMessage, status } = useAssistantChat(toRef(props, 'resourceId'))

const input = ref('')
const copied = ref(false)

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

function submit() {
  const text = input.value.trim()
  if (!text || waiting.value || busy.value) return
  sendMessage({ text })
  input.value = ''
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
