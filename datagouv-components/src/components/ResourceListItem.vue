<template>
  <AppLink
    ref="row"
    v-bind="$attrs"
    :to
    :replace
    :class="selected ? '[&&]:!bg-gray-200' : '[&&]:hover:!bg-gray-100'"
    class="grid h-7 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded px-1 py-1 text-left !bg-none !no-underline"
    @pointerenter="openOnHover"
    @pointerleave="closeTooltip"
    @focus="show = true"
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
    <!-- Capped and truncated: an `auto` grid track floors at its content width, so an
         unusually long format (`www:link-1.0-http--samples`) would otherwise squeeze
         the title track to nothing and overflow the fixed-height row. -->
    <span
      v-if="resource.format"
      class="max-w-24 truncate rounded bg-gray-lower px-1.5 py-0.5 text-[12px] uppercase leading-4 text-gray-medium"
      :title="resource.format"
    >{{ resource.format }}</span>
  </AppLink>

  <!-- Hover card: the row truncates the title, so surface the full name plus the
       same metadata line as the viewer header. Placed beside the row (not below) so
       it doesn't hide the sibling rows we're scanning. -->
  <Teleport to="body">
    <div
      v-if="show"
      ref="card"
      role="tooltip"
      class="pointer-events-none z-[80] w-max rounded border border-gray-default bg-white p-2 text-left shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]"
      :style="floatingStyles"
    >
      <span class="block whitespace-nowrap text-[13px] font-medium leading-5 text-gray-title">{{ resource.title || t('Fichier sans nom') }}</span>
      <div class="mt-1 flex items-center gap-1 text-[12px] leading-4 text-gray-medium">
        <FormattedDate
          :date="resource.last_modified"
          format="relative"
          :label="date => t('mis à jour {date}', { date })"
        />
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
import { computed, ref, useTemplateRef } from 'vue'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useEventListener } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'
import { RiDownloadLine } from '@remixicon/vue'
import AppLink from './AppLink.vue'
import File from './Icons/File.vue'
import FormattedDate from './FormattedDate.vue'
import { getResourceFormatIcon, getResourceIconColor, getResourceFilesize } from '../functions/resources'
import { filesize, summarize } from '../functions/helpers'
import { useTranslation } from '../composables/useTranslation'
import type { Resource } from '../types/resources'

// The hover card below is a second root node, so Vue drops fallthrough attributes
// unless we place them ourselves: without this, a listener bound by the parent
// (the selector's `@click="close()"`) would silently never fire.
defineOptions({ inheritAttrs: false })

// Shared row for a single resource (sidebar + resource selector). Renders as a
// navigation link so switching resource is a real link — the URL is the source of
// truth for the selection.
const props = withDefaults(defineProps<{
  resource: Resource
  to: RouteLocationRaw
  selected?: boolean
  replace?: boolean
}>(), {
  selected: false,
  replace: false,
})

const { t } = useTranslation()

// Render the icon directly (not via ResourceIcon which forces a gray color) so the
// colored badge can tint it through currentColor + [&_svg]:fill-current.
const iconComponent = computed(() => (props.resource.format ? getResourceFormatIcon(props.resource.format) : null) ?? File)
const iconColor = computed(() => getResourceIconColor(props.resource.format))

const humanFilesize = computed(() => {
  const size = getResourceFilesize(props.resource)
  return size ? filesize(size) : null
})

// Hover card teleported to <body> so the sidebar's `overflow` doesn't clip it, hence
// the fixed strategy. `shift` keeps it inside the viewport for a row near an edge, and
// `autoUpdate` follows the row when its scrollable container moves under the pointer.
const show = ref(false)
const row = useTemplateRef<InstanceType<typeof AppLink>>('row')
const card = useTemplateRef<HTMLElement>('card')
const rowEl = computed(() => row.value?.$el as HTMLElement | undefined)
const { floatingStyles } = useFloating(rowEl, card, {
  placement: 'right-start',
  strategy: 'fixed',
  middleware: [offset(16), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})

// A tap fires a pointer enter too, so the card would flash on every touch selection
// in the mobile resource picker. Only a real pointer opens it — keyboard focus still
// does, through @focus.
function openOnHover(event: PointerEvent) {
  if (event.pointerType === 'mouse') show.value = true
}

function closeTooltip() {
  show.value = false
}

// A hover-shown card gets no `mouseleave` when the window loses focus (alt-tab) or
// the pointer leaves the document, so it would linger on return — close it in those
// cases too.
useEventListener(window, 'blur', closeTooltip)
useEventListener(document, 'mouseleave', closeTooltip)
</script>
