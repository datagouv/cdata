<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    :class="size === 'sm' ? markdownSmClasses : markdownClasses"
    v-html="formatMarkdown(content, minHeading)"
  />
</template>

<script setup lang="ts">
import { formatMarkdown } from '@datagouv/components-next'
import { markdownClasses, markdownSmClasses } from '~/utils/markdown'

withDefaults(defineProps<{
  content: string
  minHeading?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'sm' | 'md'
}>(), {
  minHeading: 3,
  size: 'sm',
})
</script>
