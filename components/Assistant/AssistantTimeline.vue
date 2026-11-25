<template>
  <section
    role="status"
    class="py-1"
    data-testid="assistant-timeline"
  >
    <!-- The shimmer repeats the label in a pseudo-element, which screen readers
    may read twice: the sr-only text is the spoken one. -->
    <p class="sr-only">
      {{ announced }}
    </p>
    <div aria-hidden="true">
      <div class="mb-2 flex items-center gap-1.5 text-[11px] leading-5 text-new-gray-medium">
        <AssistantSpinner />
        <span>{{ timeline.title }}</span>
      </div>
      <ol class="m-0 list-none space-y-1 p-0">
        <li
          v-for="(step, index) in timeline.steps"
          :key="index"
          class="relative grid min-h-5 grid-cols-[14px_minmax(0,1fr)] gap-2"
        >
          <span class="relative flex justify-center">
            <RiCheckLine
              v-if="step.status === 'complete'"
              class="mt-[3px] size-3.5 text-new-gray-medium"
            />
            <span
              v-else
              class="mt-[7px] size-1.5 rounded-full bg-new-gray-medium"
            />
            <span
              v-if="index < timeline.steps.length - 1"
              class="absolute left-1/2 top-3.5 h-[calc(100%+1px)] w-px -translate-x-1/2 bg-new-gray-light"
            />
          </span>
          <p
            v-if="step.status === 'active'"
            class="m-0 text-[11px] leading-5"
          >
            <span
              class="assistant-shimmer"
              :data-text="step.label"
            >{{ step.label }}</span>
          </p>
          <p
            v-else
            class="m-0 text-[11px] leading-5 text-new-gray-medium"
          >
            {{ step.label }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RiCheckLine } from '@remixicon/vue'
import { computed } from 'vue'
import AssistantSpinner from './AssistantSpinner.vue'
import type { TurnTimeline } from './useTurnTimeline'

const props = defineProps<{
  timeline: TurnTimeline
}>()

const announced = computed(() => props.timeline.steps.findLast(step => step.status === 'active')?.label ?? '')
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
