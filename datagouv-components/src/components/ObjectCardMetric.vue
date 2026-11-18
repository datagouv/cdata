<template>
  <span class="inline-flex items-center gap-0.5 text-xs/[18px] tabular-nums">
    <component
      :is="icon"
      class="size-3.5 flex-none"
      aria-hidden="true"
    />
    <span aria-hidden="true">{{ summarize(value) }}<template v-if="$slots.default">&nbsp;<slot /></template></span>
    <span class="sr-only">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { summarize } from '../functions/helpers'

defineProps<{
  icon: Component
  value: number
  // Full sentence read by screen readers instead of the abbreviated value, e.g. "1 234 vues"
  label: string
}>()
</script>
