<template>
  <span
    class="inline-flex items-center gap-1 max-w-full min-h-6 px-2 py-0.5 rounded border border-current/20 text-xs/[18px] font-medium"
    :class="toneClass"
  >
    <component
      :is="icon"
      v-if="icon"
      class="size-3.5 flex-none"
      aria-hidden="true"
    />
    <span class="min-w-0 [overflow-wrap:anywhere]"><slot /></span>
  </span>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(defineProps<{
  icon?: Component | null
  tone?: 'neutral' | 'info' | 'warning' | 'yellow' | 'danger'
}>(), {
  tone: 'neutral',
})

const toneClass = computed(() => ({
  neutral: 'bg-gray-lower text-gray-plain',
  info: 'bg-blue-france-contrast text-new-primary',
  warning: 'bg-new-warning-light text-new-warning',
  yellow: 'bg-warning2-lightest text-warning2-dark',
  danger: 'bg-new-error-light text-new-error',
})[props.tone])
</script>
