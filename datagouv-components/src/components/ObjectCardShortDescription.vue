<template>
  <p
    v-if="shortDescription"
    class="dg-card-description"
  >
    {{ shortDescription }}
  </p>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
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
.dg-card-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
  margin: 0;
  color: var(--dg-card-text-secondary);
  font: var(--dg-card-weight-regular) var(--dg-card-text-body)/var(--dg-card-leading-body)
    var(--dg-card-font-sans);
}
</style>
