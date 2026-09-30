<template>
  <AppLink
    ref="row"
    v-bind="$attrs"
    :to
    :replace
    :class="[
      selected ? '[&&]:!bg-gray-200' : '[&&]:hover:!bg-gray-100',
      // Expanded, each row is its own grid: fixed tracks keep the extra columns
      // aligned from one row to the next, where `auto` tracks would follow each
      // row's content.
      expanded ? 'grid-cols-[auto_minmax(0,1fr)_13rem_5rem_6rem_4rem]' : 'grid-cols-[auto_minmax(0,1fr)_auto]',
    ]"
    class="grid h-8 w-full items-center gap-1 rounded px-1 py-1 text-left !bg-none !no-underline"
    @pointerenter="openOnHover"
    @pointerleave="closeTooltip"
    @focus="show = true"
    @blur="closeTooltip"
  >
    <ResourceIconBadge :resource />
    <div class="flex min-w-0 items-baseline gap-0.5 whitespace-nowrap leading-4">
      <span
        class="truncate text-[14px]"
        :class="selected ? 'font-extrabold text-gray-title' : 'font-medium text-gray-medium'"
      >{{ resource.title || t('Fichier sans nom') }}</span>
      <template v-if="humanFilesize && !expanded">
        <span class="shrink-0 text-[14px] text-gray-medium">·</span>
        <span class="shrink-0 text-[13px] text-gray-medium">{{ humanFilesize }}</span>
      </template>
    </div>
    <template v-if="expanded">
      <span class="truncate text-[13px] text-gray-medium">
        <TranslationT keypath="Mis à jour le {date}">
          <template #date>
            <FormattedDate :date="resource.last_modified" />
          </template>
        </TranslationT>
      </span>
      <span class="text-right text-[13px] tabular-nums text-gray-medium">{{ humanFilesize }}</span>
    </template>
    <!-- Capped and truncated: an `auto` grid track floors at its content width, so an
         unusually long format (`www:link-1.0-http--samples`) would otherwise squeeze
         the title track to nothing and overflow the fixed-height row. -->
    <span
      v-if="resource.format"
      class="max-w-24 justify-self-start truncate rounded bg-gray-lower px-1.5 py-0.5 text-[13px] uppercase leading-4 text-gray-medium"
      :title="resource.format"
    >{{ resource.format }}</span>
    <!-- Holds the format track so the downloads stay in their column. -->
    <span v-else-if="expanded" />
    <span
      v-if="expanded"
      class="inline-flex items-center justify-end gap-1 text-[13px] tabular-nums text-gray-medium"
    >
      <RiDownloadLine
        class="size-3"
        aria-hidden="true"
      />
      {{ summarize(resource.metrics.views) }}
    </span>
  </AppLink>

  <!-- Hover card: the row truncates the title, so surface the full name plus the
       same metadata line as the viewer header. Placed beside the row (not below) so
       it doesn't hide the sibling rows we're scanning.
       ClientOnly: Vue hydrates a teleport by scanning the target from its first child,
       so an SSR-rendered teleport to `body` breaks as soon as anything else is prepended
       there — and Nuxt emits the `bodyOpen` head tags before it. The card only ever opens
       on hover, so there is nothing to render on the server anyway. -->
  <ClientOnly>
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
          <TranslationT keypath="mis à jour {date}">
            <template #date>
              <FormattedDate
                :date="resource.last_modified"
                format="relative"
              />
            </template>
          </TranslationT>
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
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useEventListener } from '@vueuse/core'
import type { RouteLocationRaw } from 'vue-router'
import { RiDownloadLine } from '@remixicon/vue'
import AppLink from './AppLink.vue'
import ClientOnly from './ClientOnly.vue'
import FormattedDate from './FormattedDate.vue'
import ResourceIconBadge from './ResourceIconBadge.vue'
import TranslationT from './TranslationT.vue'
import { getResourceFilesize } from '../functions/resources'
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
  // Full-width list: the row also shows the update date, size and downloads.
  expanded?: boolean
}>(), {
  selected: false,
  replace: false,
  expanded: false,
})

const { t } = useTranslation()

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
