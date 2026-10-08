<template>
  <div
    class="flex"
    :class="underline ? 'border-b border-gray-default gap-4' : ['bg-gray-lower rounded p-1 gap-1', { 'w-fit': !grow }]"
    role="group"
    @keydown="onContainerKeydown"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="option.value === modelValue"
      :tabindex="option.value === modelValue ? 0 : -1"
      class="flex items-center justify-center gap-2 text-sm"
      :class="[
        underline ? 'py-2 px-1' : 'rounded py-1.5 px-3',
        grow ? 'flex-1' : '',
        option.value === modelValue
          ? underline
            ? 'text-new-primary font-bold border-b-2 border-b-new-primary -mb-px'
            : 'bg-white font-bold shadow-sm'
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

const props = withDefaults(defineProps<{
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

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Roving tabindex: only the active segment is in the tab order; arrow keys
// move between segments (standard segmented-control keyboard model).
function onContainerKeydown(event: KeyboardEvent) {
  const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!direction && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  const index = props.options.findIndex(o => o.value === props.modelValue)
  const last = props.options.length - 1
  const next = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? last
      : Math.min(last, Math.max(0, index + direction))
  emit('update:modelValue', props.options[next].value)
}
</script>
