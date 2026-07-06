<template>
  <aside
    v-if="!collapsed"
    class="w-full md:w-72 shrink-0 p-4 md:pl-0"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold uppercase mb-0">
        {{ t('Ressources') }}
      </h3>
      <button
        type="button"
        :title="t('Masquer le panneau')"
        class="p-1 hover:bg-gray-100 rounded"
        @click="$emit('update:collapsed', true)"
      >
        <RiArrowLeftSLine class="size-5" />
      </button>
    </div>

    <div class="mb-3">
      <label
        :for="searchId"
        class="sr-only"
      >{{ t('Rechercher') }}</label>
      <input
        :id="searchId"
        :value="search"
        type="search"
        class="w-full border border-gray-default rounded px-2.5 py-1.5 text-sm"
        :placeholder="t('Rechercher')"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="space-y-4 overflow-y-auto md:max-h-[calc(100vh-14rem)]">
      <div
        v-for="group in groups"
        :key="group.type"
      >
        <div class="text-xs text-gray-plain font-bold uppercase mb-1.5 border-b border-gray-default pb-1">
          {{ getResourceLabel(group.type, group.total) }}
        </div>
        <ul class="list-none p-0 m-0 space-y-0.5">
          <li
            v-for="resource in group.items"
            :key="resource.id"
          >
            <ResourceListItem
              :resource
              :to="resourceTo(resource)"
              :replace
              :selected="resource.id === selectedResourceId"
            />
          </li>
        </ul>
        <button
          v-if="group.items.length < group.total"
          type="button"
          class="w-full text-left px-2 py-1.5 text-sm text-blue-default hover:underline"
          @click="$emit('load-more', group.type)"
        >
          {{ t('Charger plus…') }}
        </button>
      </div>
    </div>
  </aside>

  <div
    v-else
    class="shrink-0 flex items-start pt-1"
  >
    <button
      type="button"
      :title="t('Afficher le panneau des ressources')"
      class="p-1 hover:bg-gray-100 rounded border border-gray-default"
      @click="$emit('update:collapsed', false)"
    >
      <RiArrowRightSLine class="size-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RiArrowRightSLine, RiArrowLeftSLine } from '@remixicon/vue'
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

const searchId = useId()
</script>
