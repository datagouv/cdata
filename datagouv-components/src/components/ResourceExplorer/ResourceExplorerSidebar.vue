<template>
  <aside
    class="flex shrink-0 flex-col border-r border-gray-default bg-white transition-[width] duration-200"
    :class="collapsed ? 'w-12' : 'w-[246px]'"
  >
    <div
      class="flex h-14 items-center border-b border-gray-default bg-gray-50 px-3"
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

    <div
      v-if="!collapsed"
      class="flex flex-col gap-3 overflow-y-auto p-2"
    >
      <label class="flex h-8 items-center gap-1 rounded border border-gray-default bg-gray-50 px-2">
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
          class="w-full px-1 py-1 text-left text-[13px] text-blue-default hover:underline"
          @click="$emit('load-more', group.type)"
        >
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
  </aside>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { RiSidebarFoldLine, RiSidebarUnfoldLine, RiSearchLine } from '@remixicon/vue'
import ResourceListItem from '../ResourceListItem.vue'
import { getResourceLabel } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'
import type { Resource, ResourceGroup, ResourceType } from '../../types/resources'

const { t } = useTranslation()

defineProps<{
  groups: ResourceGroup[]
  selectedResourceId: string | null
  collapsed: boolean
  search: string
  resourceTo: (resource: Resource) => RouteLocationRaw
  replace?: boolean
}>()

defineEmits<{
  'load-more': [type: ResourceType]
  'update:collapsed': [value: boolean]
  'update:search': [value: string]
}>()
</script>
