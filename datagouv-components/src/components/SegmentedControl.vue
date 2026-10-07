<template>
  <div
    class="flex"
    :class="underline ? 'border-b border-gray-default gap-4' : ['bg-gray-lower rounded p-1 gap-1', { 'w-fit': !grow }]"
    role="group"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="option.value === modelValue"
      class="flex items-center justify-center gap-2 text-sm"
      :class="[
        underline ? 'py-2 px-1' : 'rounded py-1.5 px-3',
        grow && !underline ? 'flex-1' : '',
        option.value === modelValue
          ? underline
            ? 'text-new-primary font-bold border-b-2 border-b-new-primary -mb-px'
            : 'bg-white font-bold shadow-sm'
          : underline
            ? 'text-gray-medium hover:text-gray-title'
            : 'text-gray-medium hover:text-gray-title',
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
  // Fill the available width and stretch the segments (default: fit content)
  grow?: boolean
  // Underline variant: left-aligned tabs over a bottom border, active segment
  // in blue with a thicker blue underline (default: pill track)
  underline?: boolean
}>(), {
  grow: false,
  underline: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
