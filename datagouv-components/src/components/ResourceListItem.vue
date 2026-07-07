<template>
  <AppLink
    v-if="!disabled"
    :to
    :replace
    :class="selected ? '[&&]:!bg-gray-200' : '[&&]:hover:!bg-gray-100'"
    class="grid h-7 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded px-1 py-1 text-left !bg-none !no-underline"
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
      class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[12px] uppercase leading-4 text-gray-medium"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'
import File from './Icons/File.vue'
import { getResourceFormatIcon, getResourceIconColor, getResourceFilesize } from '../functions/resources'
import { filesize } from '../functions/helpers'
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

// Render the icon directly (not via ResourceIcon which forces a gray color) so the
// colored badge can tint it through currentColor + [&_svg]:fill-current.
const iconComponent = computed(() => (props.resource.format ? getResourceFormatIcon(props.resource.format) : null) ?? File)
const iconColor = computed(() => getResourceIconColor(props.resource.format))

const humanFilesize = computed(() => {
  const size = getResourceFilesize(props.resource)
  return size ? filesize(size) : null
})
</script>
