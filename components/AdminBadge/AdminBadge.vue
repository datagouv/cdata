<template>
  <span
    class="inline-flex items-center space-x-1 font-bold uppercase"
    :class="[colors, sizes, { 'whitespace-nowrap': noWrap }]"
  >
    <component
      :is="icon"
      v-if="icon"
      :class="iconSize"
    />
    <span>
      <slot />
    </span>
    <component
      :is="iconRight"
      v-if="iconRight"
      :class="iconSize"
    />
  </span>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { AdminBadgeType } from '~/types/types'

const props = withDefaults(defineProps<{
  type: AdminBadgeType
  size: 'xs' | 'sm'
  icon?: Component
  iconRight?: Component
  noWrap?: boolean
  iconSize?: string
}>(), {
  noWrap: true,
})

const colors = computed(() => {
  return {
    primary: 'text-new-info bg-new-info-light',
    secondary: 'text-secondary-dark bg-secondary-lightest',
    success: 'text-new-success bg-new-success-light',
    warning: 'text-new-warning bg-new-warning-light',
    danger: 'text-new-error bg-new-error-light',
    default: 'text-gray-plain bg-gray-lower',
    pink: 'text-pink bg-pink-soft',
    // DSFR decorative "illustration" colour, for categorical (non-status) badges.
    teal: 'text-new-green-illustration bg-new-green-illustration-light',
  }[props.type]
})

const sizes = computed(() => {
  return {
    xs: 'text-xs/5 px-1 rounded-sm',
    sm: 'text-xs/6 px-2 rounded',
  }[props.size]
})

const iconSize = computed(() => props.iconSize || 'size-3')
</script>
