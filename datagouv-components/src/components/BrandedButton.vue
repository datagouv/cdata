<template>
  <!-- 46 42 32 -->
  <component
    :is="href ? AppLink: 'button'"
    class="inline-flex items-center justify-center font-marianne font-medium border !bg-none !no-underline after:content-none outline-none focus-visible:ring-2 focus-visible:ring-new-focus focus-visible:ring-offset-2"
    :class="[colors, sizes, removePaddingsIfNoBorders, isDisabled && color !== 'primary' && color !== 'secondary' ? '!opacity-50' : '', iconRight && !newTab ? 'flex-row-reverse space-x-reverse' : '']"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :role="href ? 'link' : ''"
    :to="isDisabled ? undefined : href"
    :target="newTab ? '_blank' : undefined"
    :type
  >
    <AnimatedLoader
      v-if="loading"
      size="16"
      :color="color === 'primary' ? 'white' : 'primary'"
    />
    <component
      :is="icon"
      v-else-if="icon"
      :class="iconSize"
      v-bind="iconAttrs"
    />
    <span
      v-if="hasText"
      class="whitespace-nowrap"
      :class="{ 'sr-only': iconOnly, 'sr-only sm:not-sr-only': iconOnlyOnMobile }"
    ><slot /></span>
    <RiExternalLinkLine
      v-if="newTab"
      :class="iconSize"
    />
  </component>
</template>

<script setup lang="ts">
import type {
  Component,
  Slot,
  VNode,
} from 'vue'
import {
  Comment,
  computed,
  inject,
  Text,
  useSlots,
} from 'vue'
import { RiExternalLinkLine } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'
import { bannerActionTypeKey } from './BannerAction.vue'
import AnimatedLoader from './AnimatedLoader.vue'

export type ColorType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'brown-illustration' | 'green-illustration' | 'white-flat'

const props = withDefaults(defineProps<{
  size?: '2xs' | 'xs' | 'sm' | 'lg' | 'xl'
  color?: ColorType
  disabled?: boolean
  loading?: boolean
  icon?: Component
  iconAttrs?: Record<string, string>
  href?: string | RouteLocationRaw
  newTab?: boolean
  iconOnly?: boolean
  iconOnlyOnMobile?: boolean
  iconRight?: boolean
  keepMarginsEvenWithoutBorders?: boolean
  type?: 'submit' | 'button'
}>(), {
  newTab: false,
  iconOnly: false,
  iconRight: false,
  keepMarginsEvenWithoutBorders: false,
})

const slots = useSlots()

const type = computed(() => {
  if (props.type) return props.type
  if (props.href) return undefined

  return 'button'
})

const size = computed(() => {
  if (props.size) return props.size
  if (bannerActionType) return 'xs'
  return 'sm'
})

const color = computed<ColorType>(() => {
  if (props.color) return props.color
  if (bannerActionType) {
    return {
      primary: 'secondary' as ColorType,
      warning: 'warning' as ColorType,
      danger: 'danger' as ColorType,
    }[bannerActionType]
  }
  return 'primary'
})

const hasText = computed(() => {
  return hasSlotContent(slots.default) && !props.iconOnly
})
const bannerActionType = inject(bannerActionTypeKey, null)

const isDisabled = computed(() => props.disabled || props.loading)

const colors = computed(() => {
  return {
    'primary': isDisabled.value
      ? 'text-new-disabled-text bg-new-disabled-background !border-new-disabled-background'
      : 'text-white bg-new-primary !border-new-primary hover:!bg-new-primary-hover hover:!border-new-primary-hover',
    'secondary': isDisabled.value
      ? 'text-new-disabled-text bg-white !border-new-disabled-background'
      : 'text-new-gray-dark bg-white !border-new-gray-dark [&&]:hover:!bg-gray-some',
    'tertiary': `text-gray-plain !border-transparent ${!isDisabled.value ? '[&&]:hover:!bg-gray-some' : ''}`,
    'warning': `text-new-warning bg-white !border-new-warning ${!isDisabled.value ? '[&&]:hover:!bg-gray-some' : ''}`,
    'danger': `!text-new-error bg-white !border-new-error ${!isDisabled.value ? '[&&]:hover:!bg-gray-some' : ''}`,
    'brown-illustration': `!border-none bg-new-brown-illustration text-white ${!isDisabled.value ? '[&&]:hover:!bg-new-brown-illustration/90' : ''}`,
    'green-illustration': `!border-none bg-new-green-illustration text-white ${!isDisabled.value ? '[&&]:hover:!bg-new-green-illustration/90' : ''}`,
    'blue-illustration': `!border-none bg-new-blue-illustration text-white ${!isDisabled.value ? '[&&]:hover:!bg-new-blue-illustration/90' : ''}`,
    'white-flat': `!border-none bg-white ${!isDisabled.value ? '[&&]:hover:!bg-white/90' : ''}`,
  }[color.value]
})

const sizes = computed(() => {
  return {
    'xl': `text-xl h-16 ${hasText.value ? 'px-4 gap-x-2' : 'w-16 px-3'}`,
    'lg': `text-lg h-12 ${hasText.value ? 'px-4 gap-x-2' : 'w-12 px-3'}`,
    'sm': `text-sm h-10 leading-none ${hasText.value ? 'px-4 gap-x-1' : 'w-10 px-2.5'}`,
    'xs': `text-xs h-8 leading-[0.875rem] ${hasText.value ? 'px-4 gap-x-1' : 'w-8 px-2'}`,
    '2xs': `text-xs leading-[0.875rem] p-1 gap-x-1`,
  }[size.value]
})

const hasBorders = computed(() => {
  return props.color !== 'tertiary'
})

const removePaddingsIfNoBorders = computed(() => {
  if (hasBorders.value) return ''
  if (props.keepMarginsEvenWithoutBorders) return ''

  return {
    'xl': hasText.value ? '-mx-4' : '-mx-3',
    'lg': hasText.value ? '-mx-4' : '-mx-3',
    'sm': hasText.value ? '-mx-4' : '-mx-2.5',
    'xs': hasText.value ? '-mx-4' : '-mx-2',
    '2xs': '-m-1',
  }[size.value]
})

const iconSize = computed(() => {
  return {
    'xl': (hasBorders.value || hasText.value) ? 'size-8' : 'size-10',
    'lg': (hasBorders.value || hasText.value) ? 'size-6' : 'size-8',
    'sm': (hasBorders.value || hasText.value) ? 'size-4' : 'size-6',
    'xs': (hasBorders.value || hasText.value) ? 'size-3' : 'size-5',
    '2xs': (hasBorders.value || hasText.value) ? 'size-3' : 'size-4',
  }[size.value]
})

function hasSlotContent(slot: Slot | undefined, slotProps = {}): boolean {
  if (!slot) return false

  return slot(slotProps).some((vnode: VNode) => {
    if (vnode.type === Comment) return false

    if (Array.isArray(vnode.children) && !vnode.children.length) return false

    return (
      vnode.type !== Text
      || (typeof vnode.children === 'string' && vnode.children.trim() !== '')
    )
  })
}
</script>
