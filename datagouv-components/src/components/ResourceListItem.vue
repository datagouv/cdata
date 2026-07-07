<template>
  <AppLink
    v-if="!disabled"
    :to
    :replace
    :class="selected ? '[&&]:!bg-gray-200' : '[&&]:hover:!bg-gray-100'"
    class="grid h-7 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded px-1 py-1 text-left !bg-none !no-underline"
    @mouseenter="openTooltip"
    @mouseleave="closeTooltip"
    @focus="openTooltip"
    @blur="closeTooltip"
  >
    <span
      :class="[iconColor, '[&_svg]:fill-current']"
      class="flex size-5 shrink-0 items-center justify-center rounded-[1px]"
    >
      <component
        :is="iconComponent"
        class="size-4"
        aria-hidden="true"
      />
    </span>
    <div class="flex min-w-0 items-baseline gap-0.5 whitespace-nowrap leading-4">
      <span
        class="truncate text-[13px]"
        :class="selected ? 'font-extrabold text-gray-title' : 'font-medium text-gray-medium'"
      >{{ resource.title || t('Fichier sans nom') }}</span>
      <template v-if="humanFilesize">
        <span class="shrink-0 text-[13px] text-gray-medium">·</span>
        <span class="shrink-0 text-[12px] text-gray-medium">{{ humanFilesize }}</span>
      </template>
    </div>
    <span
      v-if="resource.format"
      class="shrink-0 rounded bg-gray-lower px-1.5 py-0.5 text-[12px] uppercase leading-4 text-gray-medium"
    >{{ resource.format }}</span>
  </AppLink>
  <div
    v-else
    :title="disabledTitle"
    class="grid h-7 w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-1 rounded px-1 py-1 text-gray-medium cursor-not-allowed"
  >
    <span
      :class="[iconColor, '[&_svg]:fill-current']"
      class="flex size-5 shrink-0 items-center justify-center rounded-[1px] opacity-50"
    >
      <component
        :is="iconComponent"
        class="size-4"
        aria-hidden="true"
      />
    </span>
    <span class="truncate text-[13px] opacity-70">{{ resource.title || t('Fichier sans nom') }}</span>
  </div>

  <!-- Hover card: the row truncates the title, so surface the full name plus the
       same metadata line as the viewer header. Positioned to the right of the menu
       (not below) so it doesn't hide the sibling rows we're scanning. -->
  <Teleport to="body">
    <div
      v-if="tooltipPos"
      ref="tooltipRef"
      role="tooltip"
      class="pointer-events-none fixed z-[80] w-max rounded border border-gray-default bg-white p-2 text-left shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]"
      :style="{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }"
    >
      <span class="block whitespace-nowrap text-[13px] font-medium leading-5 text-gray-title">{{ resource.title || t('Fichier sans nom') }}</span>
      <div class="mt-1 flex items-center gap-1 text-[12px] leading-4 text-gray-medium">
        <span>{{ t('mis à jour {date}', { date: formatRelativeIfRecentDate(resource.last_modified) }) }}</span>
        <template v-if="humanFilesize">
          <span>·</span>
          <span>{{ humanFilesize }}</span>
        </template>
        <template v-if="resource.format">
          <span>·</span>
          <span class="rounded bg-gray-lower px-1.5 py-0.5 uppercase leading-4">{{ resource.format }}</span>
        </template>
        <span>·</span>
        <span class="inline-flex items-center gap-0.5">
          <RiDownloadLine
            class="size-3"
            aria-hidden="true"
          />
          {{ summarize(resource.metrics.views) }}
        </span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'
import { RiDownloadLine } from '@remixicon/vue'
import AppLink from './AppLink.vue'
import File from './Icons/File.vue'
import { getResourceFormatIcon, getResourceIconColor, getResourceFilesize } from '../functions/resources'
import { filesize, summarize } from '../functions/helpers'
import { useFormatDate } from '../functions/dates'
import { useTranslation } from '../composables/useTranslation'
import type { Resource } from '../types/resources'

// Shared row for a single resource (sidebar + resource selector). Renders as a
// navigation link so switching resource is a real link (URL is the source of truth),
// except when disabled where it's a plain, inert row.
const props = withDefaults(defineProps<{
  resource: Resource
  to?: RouteLocationRaw | null
  selected?: boolean
  disabled?: boolean
  disabledTitle?: string
  replace?: boolean
}>(), {
  to: null,
  selected: false,
  disabled: false,
  replace: false,
})

const { t } = useTranslation()
const { formatRelativeIfRecentDate } = useFormatDate()

// Render the icon directly (not via ResourceIcon which forces a gray color) so the
// colored badge can tint it through currentColor + [&_svg]:fill-current.
const iconComponent = computed(() => (props.resource.format ? getResourceFormatIcon(props.resource.format) : null) ?? File)
const iconColor = computed(() => getResourceIconColor(props.resource.format))

const humanFilesize = computed(() => {
  const size = getResourceFilesize(props.resource)
  return size ? filesize(size) : null
})

// Fixed-positioned hover card, teleported to <body> so the sidebar's `overflow`
// doesn't clip it. Anchored to the right edge of the menu (the nearest <aside>,
// falling back to the row) and vertically aligned to the hovered row.
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipPos = ref<{ top: number, left: number } | null>(null)

async function openTooltip(event: MouseEvent | FocusEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const anchor = (el.closest('aside') ?? el).getBoundingClientRect()
  const left = anchor.right + 8
  tooltipPos.value = { top: rect.top, left }

  // Re-clamp against the actual card size once it has rendered so a row near the
  // bottom of the viewport, or a wide sidebar on a narrow screen, doesn't push the
  // card off-screen.
  await nextTick()
  const card = tooltipRef.value
  if (card && tooltipPos.value) {
    const maxTop = window.innerHeight - card.offsetHeight - 8
    const maxLeft = window.innerWidth - card.offsetWidth - 8
    tooltipPos.value = {
      top: Math.max(8, Math.min(rect.top, maxTop)),
      left: Math.max(8, Math.min(left, maxLeft)),
    }
  }
}

function closeTooltip() {
  tooltipPos.value = null
}

// A hover-shown card gets no `mouseleave` when the window loses focus (alt-tab) or
// the pointer leaves the document, so it would linger on return — close it in those
// cases too.
useEventListener(window, 'blur', closeTooltip)
useEventListener(document, 'mouseleave', closeTooltip)
</script>
