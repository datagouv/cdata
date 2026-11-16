<template>
  <component
    :is="to ? AppLink : isButton ? 'button' : 'span'"
    :to
    :type="isButton ? 'button' : undefined"
    :aria-pressed="pressed"
    class="inline-flex items-center gap-1 max-w-full min-h-6 py-0.5 rounded-xl border border-(--border-default-grey) text-xs/[18px] font-normal"
    :class="[stateClasses, displayedIcon && typeof displayedIcon !== 'string' ? 'pl-1.5 pr-2' : 'px-2']"
  >
    <img
      v-if="typeof displayedIcon === 'string'"
      :src="displayedIcon"
      alt=""
      class="size-3.5 flex-none object-contain"
    >
    <component
      :is="displayedIcon"
      v-else-if="displayedIcon"
      class="size-3.5 flex-none"
      aria-hidden="true"
    />
    <span class="min-w-0 [overflow-wrap:anywhere] [text-box:trim-both_cap_alphabetic]">
      <!-- Gives the button an accessible name built from its own content: "Supprimer transport" -->
      <span
        v-if="dismissible"
        class="sr-only"
      >{{ `${t('Supprimer')} ` }}</span>
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { RiCloseLine } from '@remixicon/vue'
import { computed, useAttrs, type Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useTranslation } from '../composables/useTranslation'
import AppLink from './AppLink.vue'

const props = defineProps<{
  // A string is an image URL, e.g. the SVG of a dataset label
  icon?: Component | string
  to?: RouteLocationRaw
  // Removes the tag on click: shows a cross in place of the icon
  dismissible?: boolean
}>()

// Left unbound, the tag is not a toggle and gets no aria-pressed at all
const pressed = defineModel<boolean | undefined>('pressed', { default: undefined })

const { t } = useTranslation()
const attrs = useAttrs()
const isButton = computed(() => !props.to && (props.dismissible || !!attrs.onClick || pressed.value !== undefined))
const displayedIcon = computed(() => props.dismissible ? RiCloseLine : props.icon)

const stateClasses = computed(() => {
  if (pressed.value) {
    return 'text-(--text-inverted-blue-france) bg-(--background-action-high-blue-france) focus-visible:outline-(--border-active-blue-france)'
  }
  if (props.to || isButton.value) {
    return [
      'text-(--text-label-grey) bg-transparent bg-none',
      'hover:text-(--text-action-high-blue-france) hover:bg-(--background-action-low-blue-france)',
      'focus-visible:text-(--text-action-high-blue-france) focus-visible:bg-(--background-action-low-blue-france) focus-visible:outline-(--border-active-blue-france)',
      'active:bg-(--background-action-low-blue-france-active)',
      'disabled:text-(--text-disabled-grey) disabled:bg-(--background-disabled-grey)',
    ].join(' ')
  }
  return 'text-(--text-label-grey) bg-transparent'
})
</script>
