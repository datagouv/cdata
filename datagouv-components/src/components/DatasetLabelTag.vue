<template>
  <Tag
    :to="url"
    :icon="img"
  >
    {{ badge.label }}
  </Tag>
</template>

<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'
import Tag from './Tag.vue'
import type { TranslatedBadge } from '../types/badges'

const props = defineProps<{
  badge: TranslatedBadge
  url?: string | RouteLocationRaw
}>()

const img = computedAsync(async () => {
  const labelImages = import.meta.glob('../../assets/labels/*.svg', {
    query: '?url',
    import: 'default',
  })
  const src = Object.keys(labelImages).find(path => path.includes(props.badge.kind))
  return src && labelImages[src] ? await labelImages[src]() as string : undefined
})
</script>
