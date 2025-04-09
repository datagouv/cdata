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
  type: 'primary' | 'warning' | 'gray'
}>()

const classes = computed(() => {
  return {
    primary: 'bg-datagouv-lightest text-datagouv-dark',
    warning: 'bg-warning3-lightest text-warning3-dark',
    gray: 'bg-gray-some text-gray-plain',
  }[props.type]
})
</script>
