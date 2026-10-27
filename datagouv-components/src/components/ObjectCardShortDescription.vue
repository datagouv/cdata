<template>
  <p v-if="shortDescription" class="object-card-description">
    {{ shortDescription }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { removeMarkdownSync } from '../functions/markdown'

const props = withDefaults(
  defineProps<{
    text?: string | null
    maxLength?: number
  }>(),
  {
    maxLength: 300,
  },
)

// Truncate in JS to avoid sending very long markdown-cleaned text to the DOM.
// The visual clamp is handled by CSS line-clamp-2.
const shortDescription = computed(() => {
  if (!props.text) return ''
  const cleaned = removeMarkdownSync(props.text)
  return cleaned.length > props.maxLength ? cleaned.substring(0, props.maxLength) + '…' : cleaned
})
</script>

<style scoped>
.object-card-description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  color: #555;
  font-size: 0.875rem;
  line-height: 1.375rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
