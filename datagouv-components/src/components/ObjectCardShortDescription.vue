<template>
  <p
    v-if="shortDescription"
    class="fr-text--sm fr-mt-1w fr-mb-0 overflow-wrap-anywhere hidden sm:block line-clamp-2"
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

const shortDescription = computed(() => {
  if (!props.text) return ''
  const cleaned = removeMarkdownSync(props.text)
  return cleaned.length > props.maxLength ? cleaned.substring(0, props.maxLength) + '...' : cleaned
})
</script>
