<template>
  <span class="bg-gray-lower text-xs leading-5 px-2 py-0.5 rounded-full uppercase inline-flex gap-0.5 items-center">
    <img
      v-if="img"
      :src="img"
      alt=""
    >
    {{ badge.label }}
  </span>
</template>

<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import type { TranslatedBadge } from '@/types/badges'

const props = defineProps<{
  badge: TranslatedBadge
}>()

const img = computedAsync(async () => {
  const labelImages = import.meta.glob('../../assets/labels/*.svg', {
    query: '?url',
    import: 'default',
  })
  const src = Object.keys(labelImages).find(path => path.includes(props.badge.kind))
  return src ? await labelImages[src]() as string : undefined
})
</script>
