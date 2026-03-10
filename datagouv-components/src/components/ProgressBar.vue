<template>
  <div
    role="meter"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="max"
    class="min-w-20 h-2.5 rounded-lg border border-gray-default bg-[#f5f5f5] overflow-hidden"
  >
    <div
      class="h-full rounded-lg"
      :class="barClass"
      :style="{ width: percentage + '%' }"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max?: number
  barClass?: string
}>(), {
  max: 1,
  barClass: '',
})

const percentage = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))
</script>
