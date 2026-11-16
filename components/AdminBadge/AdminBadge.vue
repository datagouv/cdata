<template>
  <span
    class="inline-flex items-center gap-1 max-w-full align-middle border border-current/20 text-xs"
    :class="[colors, sizes, medium ? 'font-medium' : 'font-normal', { 'whitespace-nowrap': noWrap }]"
  >
    <component
      :is="icon"
      v-if="icon"
      class="flex-none"
      :class="iconSize"
      aria-hidden="true"
      focusable="false"
    />
    <span class="min-w-0 [text-box:trim-both_cap_alphabetic]">
      <slot />
    </span>
    <component
      :is="iconRight"
      v-if="iconRight"
      class="flex-none"
      :class="iconSize"
      aria-hidden="true"
      focusable="false"
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
  // Business labels (access types, card labels) are medium, table statuses stay regular
  medium?: boolean
}>(), {
  noWrap: true,
  medium: false,
})

const colors = computed(() => {
  return {
    primary: 'text-new-info bg-new-info-light',
    secondary: 'text-secondary-dark bg-secondary-lightest',
    success: 'text-new-success bg-new-success-light',
    warning: 'text-new-warning bg-new-warning-light',
    yellow: 'text-warning2-dark bg-warning2-lightest',
    danger: 'text-new-error bg-new-error-light',
    default: 'text-gray-plain bg-gray-lower',
    pink: 'text-pink bg-pink-soft',
    // DSFR decorative "illustration" colour, for categorical (non-status) badges.
    teal: 'text-new-green-illustration bg-new-green-illustration-light',
  }[props.type]
})

const sizes = computed(() => {
  return {
    xs: 'min-h-5 py-px px-1.5 rounded-md leading-4',
    sm: 'min-h-6 py-0.5 px-2 rounded-md leading-[18px]',
  }[props.size]
})

const iconSize = computed(() => props.iconSize || 'size-3.5')
</script>
