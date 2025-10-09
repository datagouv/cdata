<template>
  <div
    class="!p-6"
    :class="background"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color?: 'white' | 'alt-grey'
}>(), {
  color: 'white',
})

const background = computed(() => {
  switch (props.color) {
    case 'alt-grey':
      return 'bg-gray-some'
    case 'white':
    default:
      return 'bg-white'
  }
})
</script>
