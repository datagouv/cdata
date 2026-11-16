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
      :style="leftIconStyle"
      :data-optical-offset-x="leftIconOffset.x"
      :data-optical-offset-y="leftIconOffset.y"
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
      :style="rightIconStyle"
      :data-optical-offset-x="rightIconOffset.x"
      :data-optical-offset-y="rightIconOffset.y"
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
  iconOffsetX?: -1 | 0 | 1
  iconOffsetY?: -1 | 0 | 1
  iconRightOffsetX?: -1 | 0 | 1
  iconRightOffsetY?: -1 | 0 | 1
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
    yellow: 'text-warning2-dark bg-warning2-lightest',
    danger: 'text-new-error bg-new-error-light',
    default: 'text-gray-plain bg-gray-lower',
    pink: 'text-pink bg-pink-soft',
    // DSFR decorative "illustration" colour, for categorical (non-status) badges.
    teal: 'text-new-green-illustration bg-new-green-illustration-light',
  }[props.type]
})

const iconSize = computed(() => props.iconSize || 'size-3.5')

type OpticalOffset = { x: -1 | 0 | 1, y: -1 | 0 | 1 }

// Remix icons share a 24 px canvas, but their visible weight does not always
// share its mathematical centre. These small, measured adjustments keep the
// 14 px glyphs aligned optically with the compact 12 px label.
const opticalOffsets: Record<string, OpticalOffset> = {
  RiArchiveLine: { x: 0, y: 1 },
  RiDeleteBinLine: { x: 0, y: 1 },
  RiDraftLine: { x: 0, y: 1 },
  RiExternalLinkLine: { x: 0, y: 1 },
  RiGovernmentLine: { x: 0, y: 1 },
  RiPassValidLine: { x: 0, y: 1 },
  // The lock glyph is bottom-heavy, so flex centring already aligns it with
  // the text without the downward adjustment used by the other icons.
  RiLockLine: { x: 0, y: 0 },
}

function componentName(component?: Component): string {
  if (component && typeof component === 'object' && 'name' in component)
    return String(component.name ?? '')
  return ''
}

function resolveOffset(component: Component | undefined, x: -1 | 0 | 1 | undefined, y: -1 | 0 | 1 | undefined): OpticalOffset {
  const measured = opticalOffsets[componentName(component)] ?? { x: 0, y: 0 }
  return { x: x ?? measured.x, y: y ?? measured.y }
}

const leftIconOffset = computed(() => resolveOffset(props.icon, props.iconOffsetX, props.iconOffsetY))
const rightIconOffset = computed(() => resolveOffset(props.iconRight, props.iconRightOffsetX, props.iconRightOffsetY))
const leftIconStyle = computed(() => ({
  '--admin-badge-icon-offset-x': `${leftIconOffset.value.x}px`,
  '--admin-badge-icon-offset-y': `${leftIconOffset.value.y}px`,
}))
const rightIconStyle = computed(() => ({
  '--admin-badge-icon-offset-x': `${rightIconOffset.value.x}px`,
  '--admin-badge-icon-offset-y': `${rightIconOffset.value.y}px`,
}))
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
  font-weight: 400;
  line-height: 1.125rem;
  text-transform: none;
  vertical-align: middle;
}

.admin-badge[data-size="xs"] {
  min-height: 1.25rem;
  padding: 0.0625rem 0.375rem;
  line-height: 1rem;
}

.admin-badge__label {
  transform: translateY(-0.0625rem);
}

.admin-badge[data-size="xs"] > .admin-badge__icon {
  transform: translate(
    var(--admin-badge-icon-offset-x),
    calc(-0.0625rem + var(--admin-badge-icon-offset-y))
  );
}

.admin-badge__icon {
  display: block;
  transform: translate(
    var(--admin-badge-icon-offset-x),
    var(--admin-badge-icon-offset-y)
  );
  flex-shrink: 0;
}
</style>
