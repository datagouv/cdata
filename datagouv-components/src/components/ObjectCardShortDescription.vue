<template>
  <p
    v-if="shortDescription"
    class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:line-clamp-2"
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
  maxLength: 200,
})

// Truncate in JS to avoid sending very long markdown-cleaned text to the DOM.
// The visual clamp is handled by CSS line-clamp-2.
const shortDescription = computed(() => {
  if (!props.text) return ''
  const cleaned = removeMarkdownSync(props.text)
  return cleaned.length > props.maxLength ? cleaned.substring(0, props.maxLength) + '…' : cleaned
})
</script>
