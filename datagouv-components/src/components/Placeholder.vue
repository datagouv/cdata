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
const placeholderUrl = async () => {
  const module = await import(`../../assets/placeholders/${props.type}.png`)
  return props.src ? props.src : module.default
}

const alternativeTextForDefinedImageOnly = computed(() => props.src ? props.alt : '')
const path = computedAsync(() => placeholderUrl())
</script>
