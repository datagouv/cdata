<template>
  <TextClamp
    v-bind="props"
    class="py-0.5"
    @clamp-change="(data: boolean) => $emit('clamp-change', data)"
    @update:expanded="(data: boolean) => $emit('update:expanded', data)"
  />
</template>

<script lang="ts" setup>
import TextClamp from 'vue3-text-clamp'

const props = withDefaults(
  defineProps<{
    text: string
    maxHeight?: string | number
    maxLines?: number
    expanded?: boolean
    location?: 'start' | 'middle' | 'end'
    ellipsis?: string
    autoResize?: boolean
  }>(),
  {
    expanded: false,
    location: 'end',
    ellipsis: '…',
    autoResize: false,
  },
)

defineEmits<{
  'clamp-change': [data: boolean]
  'update:expanded': [data: boolean]
}>()
</script>
