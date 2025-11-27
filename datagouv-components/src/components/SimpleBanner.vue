<template>
  <div
    class="w-full rounded p-3"
    :class="classes"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'primary' | 'primary-frame' | 'warning' | 'gray' | 'danger' | 'success' | 'pink'
}>()

const classes = computed(() => {
  return {
    'primary': 'bg-new-info-light text-new-info',
    'warning': 'bg-new-warning-light text-new-warning',
    'success': 'bg-new-success-light text-new-success',
    'danger': 'bg-new-error-light text-new-error',
    'pink': 'bg-pink-softest border-2 border-pink-soft',
    'primary-frame': 'bg-gray-50 border border-datagouv',
    'gray': 'bg-gray-some text-gray-plain',
  }[props.type]
})
</script>
