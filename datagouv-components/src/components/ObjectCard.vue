<template>
  <!--
    The title link covers the whole card through its `before` pseudo-element; interactive elements
    inside the card (owner details, quality, tooltips) sit above it with `relative z-2`.
  -->
  <article
    class="@container relative min-w-0 rounded border bg-white text-sm/[22px] text-gray-title
      has-[[data-card-link]:hover]:bg-gray-some has-[[data-card-link]:active]:bg-gray-active
      has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-new-focus has-[[data-card-link]:focus-visible]:outline-offset-3"
    :class="highlighted ? 'border-gray-secondary' : 'border-gray-default'"
  >
    <div
      v-if="$slots.cover"
      class="overflow-hidden rounded-t-[3px]"
    >
      <slot name="cover" />
    </div>
    <div
      class="flex items-start p-4"
      :class="layoutClass"
    >
      <div
        v-if="$slots.media"
        class="flex-none max-w-full"
        :class="mediaClass"
      >
        <div
          class="flex justify-center items-center max-w-full overflow-hidden rounded border border-gray-default bg-white"
          :class="frameClass"
        >
          <slot name="media" />
        </div>
      </div>
      <div class="flex flex-col gap-1 flex-1 min-w-0 w-full">
        <div class="flex items-start gap-x-2 gap-y-1 min-w-0 @max-[480px]:flex-col">
          <component
            :is="titleTag"
            class="m-0 flex-1 min-w-0 w-full text-base/6 font-semibold text-gray-title [overflow-wrap:anywhere]"
          >
            <AppLink
              :to="url"
              :target
              data-card-link
              class="line-clamp-2 text-gray-title hover:text-new-primary bg-none no-underline focus-visible:outline-none
                before:absolute before:inset-0 before:z-1 after:hidden"
            >
              <component
                :is="icon"
                v-if="icon"
                class="size-4 inline-block align-[-2px] me-1"
                aria-hidden="true"
              />
              <slot name="title" />
            </AppLink>
          </component>
          <div
            v-if="$slots.badge"
            class="flex-none @max-[480px]:order-first"
          >
            <slot name="badge" />
          </div>
        </div>
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TitleTag } from '../types/ui'
import AppLink from './AppLink.vue'

const props = withDefaults(defineProps<{
  url: RouteLocationRaw
  target?: string
  icon?: Component
  titleTag?: TitleTag
  // `sm` is a logo or an avatar, `lg` and `xl` an illustration.
  mediaSize?: 'sm' | 'lg' | 'xl'
  // Puts the media above the content instead of beside it. Over a cover, the media overlaps it.
  stacked?: boolean
  highlighted?: boolean
}>(), {
  titleTag: 'h3',
  mediaSize: 'sm',
})

const slots = defineSlots<{
  title(): unknown
  badge?(): unknown
  cover?(): unknown
  media?(): unknown
  default?(): unknown
}>()

// Beside the content, the media moves above it once the card is too narrow for both.
const layoutClass = computed(() => {
  if (props.stacked) return 'flex-col gap-3'
  if (props.mediaSize === 'sm') return 'gap-4 @max-[280px]:flex-col @max-[280px]:gap-3'
  return 'gap-4 @max-[480px]:flex-col'
})

const mediaClass = computed(() => {
  if (props.stacked && slots.cover) return 'relative -mt-10'
  if (props.mediaSize === 'sm') return ''
  return '@max-[480px]:w-full'
})

const frameClass = computed(() => ({
  sm: '',
  lg: 'w-48 h-30 @max-[480px]:w-full @max-[480px]:h-auto @max-[480px]:aspect-video',
  xl: 'w-56 h-40 @max-[480px]:w-full @max-[480px]:h-auto @max-[480px]:aspect-video',
})[props.mediaSize])
</script>
