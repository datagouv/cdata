<template>
  <img
    loading="lazy"
    :src="path"
    :alt="alternativeTextForDefinedImageOnly"
    :width="size"
    :height="size"
    v-bind="$attrs"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { computedAsync } from '@vueuse/core'

const props = defineProps<{
  type: 'author' | 'dataset' | 'news' | 'organization' | 'reuse'
  src?: string | null
  alt?: string
  size: number
}>()
async function placeholderUrl() {
  const placeholders = import.meta.glob(`../../assets/placeholders/*.png`, {
    query: '?url',
    import: 'default',
  })
  const name = Object.keys(placeholders).find(p => p.includes(props.type)) as string
  const module = placeholders[name] as () => Promise<unknown>
  const placeholder = await module()
  return props.src ? props.src : placeholder as string
}

const alternativeTextForDefinedImageOnly = computed(() => props.src ? props.alt : '')
const path = computedAsync(() => placeholderUrl())
</script>
