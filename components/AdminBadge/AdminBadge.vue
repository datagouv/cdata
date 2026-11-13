<template>
  <span
    class="admin-badge inline-flex items-center"
    :class="[colors, { 'whitespace-nowrap': noWrap }]"
    :data-size="size"
  >
    <component
      :is="icon"
      v-if="icon"
      class="admin-badge__icon"
      :class="iconSize"
      aria-hidden="true"
      focusable="false"
    />
    <span>
      <slot />
    </span>
    <component
      :is="iconRight"
      v-if="iconRight"
      class="admin-badge__icon"
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

const iconSize = computed(() => props.iconSize || 'size-3.5')
</script>

<style scoped>
.admin-badge {
  box-sizing: border-box;
  gap: 0.25rem;
  min-height: 1.5rem;
  max-width: 100%;
  padding: 0.125rem 0.5rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem;
  text-transform: none;
  vertical-align: middle;
}

.admin-badge[data-size="xs"] {
  min-height: 1.25rem;
  padding: 0 0.375rem;
}

.admin-badge__icon {
  flex-shrink: 0;
}
</style>
