<template>
  <span
    class="inline-flex items-center space-x-1 font-bold uppercase whitespace-nowrap"
    :class="[colors, sizes]"
  >
    <component
      :is="icon"
      v-if="icon"
      class="size-3"
    />
    <span>
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { AdminBadgeType } from '~/types/types'

const props = defineProps<{
  type: AdminBadgeType
  size: 'xs' | 'sm'
  icon?: Component
}>()

const colors = computed(() => {
  return {
    primary: 'text-new-info bg-new-info-light',
    secondary: 'text-secondary-dark bg-secondary-lightest',
    success: 'text-new-success bg-new-success-light',
    warning: 'text-new-warning bg-new-warning-light',
    danger: 'text-new-error bg-new-error-light',
    default: 'text-gray-plain bg-gray-lower',
    pink: 'text-pink bg-pink-soft',
  }[props.type]
})

const sizes = computed(() => {
  return {
    xs: 'text-xs/5 px-1 rounded-sm',
    sm: 'text-xs/6 px-2 rounded',
  }[props.size]
})
</script>
