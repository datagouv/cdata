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
  type: 'primary' | 'primary-frame' | 'warning' | 'gray' | 'success'
}>()

const classes = computed(() => {
  return {
    'primary': 'bg-datagouv-lightest text-datagouv-dark',
    'primary-frame': 'bg-gray-50 border border-datagouv',
    'warning': 'bg-warning3-lightest text-warning3-dark',
    'gray': 'bg-gray-some text-gray-plain',
    'success': 'bg-success-lightest text-success-dark',
  }[props.type]
})
</script>
