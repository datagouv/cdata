<template>
  <div
    v-if="responding"
    class="flex items-center gap-1.5 text-[11px] leading-5 text-new-gray-medium"
    aria-hidden="true"
    data-testid="assistant-responding"
  >
    <AssistantSpinner class="text-[11px]" />
    <span
      class="assistant-shimmer"
      :data-text="$t('Réponse en cours…')"
    >{{ $t('Réponse en cours…') }}</span>
  </div>
  <div
    v-else
    class="flex items-start gap-2 py-1 text-[13px]"
    data-testid="assistant-thinking"
  >
    <span class="sr-only">{{ $t('L’assistant réfléchit…') }}</span>
    <!-- The shimmer repeats the label in a pseudo-element, which screen readers
    may read twice: the sr-only text above is the spoken one. -->
    <span
      class="flex h-5 shrink-0 items-center text-xs text-new-gray-medium"
      aria-hidden="true"
    >
      <AssistantSpinner />
    </span>
    <div
      class="min-w-0"
      aria-hidden="true"
    >
      <p
        class="assistant-shimmer m-0 leading-5"
        :data-text="$t('Planification de la réponse…')"
      >
        {{ $t('Planification de la réponse…') }}
      </p>
      <p class="m-0 mt-0.5 text-xs leading-5 text-new-gray-medium">
        {{ $t('Compréhension de la question et choix des opérations utiles') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AssistantSpinner from './AssistantSpinner.vue'

defineProps<{
  /** The reply has started showing: a discreet line replaces the planning block. */
  responding: boolean
}>()
</script>

<style scoped>
.assistant-shimmer {
  position: relative;
  display: inline-block;
  color: var(--color-new-gray-medium-hover);
}

.assistant-shimmer::before {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(90deg, transparent 40%, var(--color-new-gray-dark) 50%, transparent 60%);
  background-size: 400% 100%;
  background-repeat: no-repeat;
  background-clip: text;
  color: transparent;
  animation: assistant-shimmer 2s linear infinite;
}

@keyframes assistant-shimmer {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-shimmer::before {
    animation: none;
    content: none;
  }
}
</style>
