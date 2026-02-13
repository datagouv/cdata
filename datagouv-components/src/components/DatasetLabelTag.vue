<template>
  <component
    :is="url ? AppLink : 'span'"
    :to="url"
    class="text-xs leading-5 px-2 py-0.5 rounded-full uppercase inline-flex items-center"
    :class="{
      'bg-none bg-datagouv hover:bg-datagouv-dark text-white gap-1': url,
      'bg-gray-lower gap-0.5': !url,
    }"
  >
    <img
      v-if="img"
      :src="img"
      alt=""
      :class="{ 'bg-white rounded-full': url }"
    >
    {{ badge.label }}
  </component>
</template>

<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'
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
