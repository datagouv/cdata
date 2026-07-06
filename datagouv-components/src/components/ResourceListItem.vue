<template>
  <AppLink
    v-if="!disabled"
    :to
    :replace
    :class="[baseClass, selected ? 'font-bold bg-blue-50 text-new-primary' : 'hover:bg-gray-100']"
  >
    <ResourceIcon
      :resource
      class="size-3.5 shrink-0"
    />
    <span class="truncate">{{ resource.title || t('Fichier sans nom') }}</span>
    <span
      v-if="showFormat && resource.format"
      class="ml-auto text-xs text-gray-medium uppercase shrink-0"
    >{{ resource.format }}</span>
  </AppLink>
  <div
    v-else
    :title="disabledTitle"
    :class="[baseClass, 'text-gray-medium cursor-not-allowed']"
  >
    <ResourceIcon
      :resource
      class="size-3.5 shrink-0 opacity-50"
    />
    <span class="truncate opacity-70">{{ resource.title || t('Fichier sans nom') }}</span>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'
import ResourceIcon from './ResourceAccordion/ResourceIcon.vue'
import { useTranslation } from '../composables/useTranslation'
import type { Resource } from '../types/resources'

// Shared row for a single resource, used in the sidebar and the resource selector.
// Renders as a navigation link (AppLink) so switching resource is a real link
// (URL is the source of truth), except when disabled where it's a plain, inert row.
const baseClass = 'flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded text-sm'

withDefaults(defineProps<{
  resource: Resource
  to?: RouteLocationRaw | null
  selected?: boolean
  disabled?: boolean
  disabledTitle?: string
  showFormat?: boolean
  replace?: boolean
}>(), {
  to: null,
  selected: false,
  disabled: false,
  showFormat: false,
  replace: false,
})

const { t } = useTranslation()
</script>
