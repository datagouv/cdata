<template>
  <div
    class="flex bg-gray-lower rounded p-1 gap-1 w-fit"
    role="group"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="option.value === modelValue"
      class="flex items-center justify-center gap-2 rounded py-1.5 px-3 text-sm"
      :class="[
        grow ? 'flex-1' : '',
        option.value === modelValue ? 'bg-white font-bold shadow-sm' : 'text-gray-medium hover:text-gray-title',
      ]"
      @click="$emit('update:modelValue', option.value)"
    >
      <component
        :is="option.icon"
        v-if="option.icon"
        class="size-4"
      />
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

export type SegmentedControlOption = {
  value: string
  label: string
  icon?: Component
}

withDefaults(defineProps<{
  modelValue: string
  options: Array<SegmentedControlOption>
  // Stretch the segments to fill the container width (default: fit content)
  grow?: boolean
}>(), {
  grow: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
