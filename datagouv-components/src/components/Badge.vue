<template>
  <component
    :is="to ? AppLink : 'span'"
    :to
    class="inline-flex items-center gap-1 max-w-full align-middle rounded-md border border-current/20 text-xs"
    :class="[toneClasses, sizeClasses, medium ? 'font-medium' : 'font-normal', { 'whitespace-nowrap': !wrap }, to && linkClasses]"
  >
    <component
      :is="icon"
      v-if="icon"
      class="size-3.5 flex-none"
      aria-hidden="true"
      focusable="false"
    />
    <!-- A single-line label too long for its container ends with an ellipsis instead of overflowing the badge.
      Clipping on x only: hidden would also clip y and cut the glyphs the text-box trim lets overflow -->
    <span
      class="min-w-0 [text-box:trim-both_cap_alphabetic]"
      :class="{ 'overflow-x-clip text-ellipsis': !wrap }"
    >
      <slot />
    </span>
    <component
      :is="iconRight"
      v-if="iconRight"
      class="size-3.5 flex-none"
      aria-hidden="true"
      focusable="false"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { BadgeTone } from '../types/ui'
import AppLink from './AppLink.vue'

const props = withDefaults(defineProps<{
  tone?: BadgeTone
  size?: 'xs' | 'sm'
  icon?: Component | null
  iconRight?: Component | null
  to?: RouteLocationRaw | null
  // Business labels (access types, object statuses) are medium, plain informations stay regular
  medium?: boolean
  wrap?: boolean
}>(), {
  tone: 'neutral',
  size: 'sm',
  medium: false,
  wrap: false,
})

const toneClasses = computed(() => ({
  neutral: 'text-gray-plain bg-gray-lower',
  primary: 'text-new-info bg-new-info-light',
  success: 'text-new-success bg-new-success-light',
  warning: 'text-new-warning bg-new-warning-light',
  yellow: 'text-warning2-dark bg-warning2-lightest',
  danger: 'text-new-error bg-new-error-light',
  pink: 'text-pink bg-pink-soft',
  // DSFR decorative "illustration" colour, for categorical (non-status) badges
  teal: 'text-new-green-illustration bg-new-green-illustration-light',
})[props.tone])

const sizeClasses = computed(() => ({
  xs: 'min-h-5 py-px px-1.5 leading-4',
  sm: 'min-h-6 py-0.5 px-2 leading-[18px]',
})[props.size])

// A linked badge keeps its colour: only its label is underlined on hover
const linkClasses = 'bg-none after:content-none hover:[&>span]:underline hover:[&>span]:decoration-1 hover:[&>span]:underline-offset-2 focus-visible:outline-(--border-active-blue-france)'
</script>
