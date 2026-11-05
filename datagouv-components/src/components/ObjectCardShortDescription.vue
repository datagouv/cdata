<template>
  <p
    v-if="shortDescription"
    class="m-0 line-clamp-2 [overflow-wrap:anywhere] text-sm/[22px] text-gray-secondary"
  >
    {{ shortDescription }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { removeMarkdownSync } from '../functions/markdown'

const props = withDefaults(defineProps<{
  text?: string | null
  maxLength?: number
}>(), {
  maxLength: 300,
})

// Truncate in JS to avoid sending very long markdown-cleaned text to the DOM.
// The visual clamp is handled by CSS line-clamp-2.
const shortDescription = computed(() => {
  if (!props.text) return ''
  const cleaned = removeMarkdownSync(props.text)
  return cleaned.length > props.maxLength ? cleaned.substring(0, props.maxLength) + '…' : cleaned
})
</script>
