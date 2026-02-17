<template>
  <span
    class="inline-flex items-center space-x-1 text-xs rounded-xl px-2 py-0.5"
    :class="classes"
  >
    <component
      :is="icon"
      v-if="icon"
      class="size-3"
    />
    <span class="-mt-px">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = defineProps<{
  icon?: Component
  type: 'secondary'
}>()

const classes = computed(() => {
  return {
    secondary: 'text-gray-title bg-gray-lower',
  }[props.type]
})
</script>
