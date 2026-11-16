<template>
  <span
    class="admin-badge inline-flex items-center"
    :class="[colors, { 'whitespace-nowrap': noWrap }]"
    :data-size="size"
    :data-center-label="centerLabel || undefined"
  >
    <component
      :is="icon"
      v-if="icon"
      class="admin-badge__icon"
      :class="iconSize"
      aria-hidden="true"
      focusable="false"
    />
    <span class="admin-badge__label">
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
  centerLabel?: boolean
}>(), {
  noWrap: true,
  centerLabel: false,
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

const iconSize = computed(() => props.iconSize || 'size-3.5')
</script>

<style scoped>
.admin-badge {
  box-sizing: border-box;
  gap: 0.25rem;
  height: 1.5rem;
  min-height: 1.5rem;
  max-width: 100%;
  padding: 0.125rem 0.5rem;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5rem;
  text-transform: none;
  vertical-align: middle;
}

.admin-badge[data-size="xs"] {
  height: 1.25rem;
  min-height: 1.25rem;
  padding: 0.0625rem 0.375rem;
  line-height: 1.25rem;
}

.admin-badge__label {
  display: inline-flex;
  align-items: center;
  height: 100%;
  line-height: inherit;
  transform: translateY(-0.0625rem);
}

.admin-badge[data-center-label="true"] .admin-badge__label {
  transform: none;
}

.admin-badge__icon {
  display: block;
  flex-shrink: 0;
}
</style>
