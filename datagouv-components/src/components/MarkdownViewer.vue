<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    :class="size === 'sm' ? markdownSmClasses : markdownClasses"
    v-html="formatMarkdown(content, { minDepth: minHeading, noHeadings })"
  />
</template>

<script setup lang="ts">
import { formatMarkdown, markdownClasses, markdownSmClasses } from '../functions/markdown'

withDefaults(defineProps<{
  content: string
  minHeading?: 1 | 2 | 3 | 4 | 5 | 6
  noHeadings?: boolean
  size?: 'sm' | 'md'
}>(), {
  minHeading: 3,
  size: 'sm',
  noHeadings: false,
})
</script>
