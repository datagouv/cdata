<template>
  <aside
    class="relative flex shrink-0 flex-col overflow-hidden border-r border-gray-default bg-white"
    :class="resizing ? '' : 'transition-[width] duration-200'"
    :style="{ width: collapsed ? '48px' : `${width}px` }"
  >
    <div
      class="flex h-14 items-center border-b border-gray-default bg-gray-some px-3"
      :class="collapsed ? 'justify-center' : 'justify-between'"
    >
      <span
        v-if="!collapsed"
        class="text-[13px] font-medium text-gray-title"
      >{{ t('Ressources') }}</span>
      <button
        type="button"
        :title="collapsed ? t('Afficher le panneau des ressources') : t('Masquer le panneau')"
        class="flex size-6 items-center justify-center rounded text-gray-plain hover:bg-gray-100"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <component
          :is="collapsed ? RiSidebarUnfoldLine : RiSidebarFoldLine"
          class="size-5"
        />
      </button>
    </div>

    <!-- min-w keeps the content laid out at the sidebar's min width so it doesn't
         reflow (badges wrapping, section titles on 2 lines) while the width animates
         open from the collapsed state — the aside's overflow-hidden clips the rest. -->
    <!-- Extra bottom padding so the last item can scroll clear of the browser's
         hover URL bar (Firefox shows it bottom-left). -->
    <div
      v-if="!collapsed"
      class="flex min-h-0 min-w-[260px] flex-1 flex-col gap-3 overflow-y-auto p-2 pb-16"
    >
      <label class="flex h-8 items-center gap-1 rounded border border-gray-default bg-gray-some px-2">
        <RiSearchLine class="size-3.5 shrink-0 text-gray-medium" />
        <span class="sr-only">{{ t('Rechercher') }}</span>
        <input
          :value="search"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-medium"
          :placeholder="t('Rechercher une ressource')"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <section
        v-for="group in groups"
        :key="group.type"
        class="space-y-0.5"
      >
        <p class="px-1 py-2 text-[12px] font-medium leading-3 text-gray-medium">
          {{ group.total }} {{ getResourceLabel(group.type) }}
        </p>
        <ResourceListItem
          v-for="resource in group.items"
          :key="resource.id"
          :resource
          :to="resourceTo(resource)"
          :replace
          :selected="resource.id === selectedResourceId"
        />
        <button
          v-if="group.items.length < group.total"
          type="button"
          :disabled="loadingType === group.type"
          class="flex w-full items-center gap-1 px-1 py-1 text-left text-[13px] text-blue-default hover:underline disabled:cursor-default disabled:no-underline"
          @click="$emit('load-more', group.type)"
        >
          <RiLoader5Line
            v-if="loadingType === group.type"
            class="size-3.5 shrink-0 animate-spin"
          />
          {{ t('Charger plus…') }}
        </button>
      </section>

      <div
        v-if="search && !groups.length"
        class="px-1 py-2"
      >
        <p class="mb-1.5 text-[13px] leading-snug text-gray-medium">
          {{ t('Pas de résultats pour « {q} »', { q: search }) }}
        </p>
        <button
          type="button"
          class="text-[13px] text-blue-default hover:underline"
          @click="$emit('update:search', '')"
        >
          {{ t('Réinitialiser la recherche') }}
        </button>
      </div>
    </div>

    <!-- Drag the right edge to resize the panel and read longer resource titles. -->
    <button
      v-if="!collapsed"
      type="button"
      :title="t('Glisser pour redimensionner')"
      class="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-new-primary/10"
      @mousedown="startResize"
    >
      <span class="sr-only">{{ t('Redimensionner la navigation') }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { RiSidebarFoldLine, RiSidebarUnfoldLine, RiSearchLine, RiLoader5Line } from '@remixicon/vue'
import ResourceListItem from '../ResourceListItem.vue'
import { getResourceLabel } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'
import { useResizable } from '../../composables/useResizable'
import type { Resource, ResourceGroup, ResourceType } from '../../types/resources'

const { t } = useTranslation()

defineProps<{
  groups: ResourceGroup[]
  selectedResourceId: string | null
  collapsed: boolean
  search: string
  loadingType: ResourceType | null
  resourceTo: (resource: Resource) => RouteLocationRaw
  replace?: boolean
}>()

defineEmits<{
  'load-more': [type: ResourceType]
  'update:collapsed': [value: boolean]
  'update:search': [value: string]
}>()

const { width, resizing, startResize } = useResizable({
  initialWidth: 300,
  minWidth: 260,
  maxWidth: 720,
})
</script>
