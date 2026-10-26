<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    :class="size === 'sm' ? markdownSmClasses : markdownClasses"
    v-html="formatMarkdown(content, { minDepth: minHeading, noHeadings, siteUrl: config.baseUrl, followLinks: followLinks || containerFollowsLinks })"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useComponentsConfig } from '../config'
import { followLinksKey, formatMarkdown, markdownClasses, markdownSmClasses } from '../functions/markdown'

withDefaults(defineProps<{
  content: string
  minHeading?: 1 | 2 | 3 | 4 | 5 | 6
  noHeadings?: boolean
  size?: 'sm' | 'md'
  // Only for content written by the team, see followLinksKey.
  followLinks?: boolean
}>(), {
  minHeading: 3,
  size: 'sm',
  noHeadings: false,
  followLinks: false,
})

const config = useComponentsConfig()
const containerFollowsLinks = inject(followLinksKey, false)
</script>
