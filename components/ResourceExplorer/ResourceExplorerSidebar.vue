<template>
  <aside
    v-if="!collapsed"
    class="w-72 shrink-0 pl-4"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold uppercase mb-0">
        {{ $t('Ressources') }}
      </h3>
      <button
        type="button"
        :title="$t('Masquer le panneau')"
        class="p-1 hover:bg-gray-100 rounded"
        @click="$emit('update:collapsed', true)"
      >
        <RiArrowRightSLine class="size-5" />
      </button>
    </div>

    <div class="mb-3">
      <label
        :for="searchId"
        class="sr-only"
      >{{ $t('Rechercher') }}</label>
      <input
        :id="searchId"
        :value="search"
        type="search"
        class="w-full border border-gray-default rounded px-2.5 py-1.5 text-sm"
        :placeholder="$t('Rechercher')"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="space-y-4 overflow-y-auto max-h-[60vh]">
      <div
        v-for="group in resources"
        :key="group.type"
      >
        <div class="text-xs text-gray-plain font-bold uppercase mb-1.5 border-b border-gray-default pb-1">
          {{ getResourceLabel(group.type, group.items.length) }}
        </div>
        <ul class="list-none p-0 m-0 space-y-0.5">
          <li
            v-for="resource in group.items"
            :key="resource.id"
          >
            <button
              type="button"
              class="w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-1.5 hover:bg-gray-100"
              :class="{
                'font-bold bg-blue-50': resource.id === selectedResourceId,
              }"
              @click="$emit('select', resource)"
            >
              <ResourceIcon
                :resource
                class="size-3.5 shrink-0"
              />
              <span class="truncate">{{ resource.title || $t('Fichier sans nom') }}</span>
            </button>
          </li>
        </ul>
        <button
          v-if="group.items.length < group.total"
          type="button"
          class="w-full text-left px-2 py-1.5 text-sm text-blue-default hover:underline"
          @click="$emit('load-more', group.type)"
        >
          {{ $t('Charger plus…') }}
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
      :title="$t('Afficher le panneau des ressources')"
      class="p-1 hover:bg-gray-100 rounded border border-gray-default"
      @click="$emit('update:collapsed', false)"
    >
      <RiArrowLeftSLine class="size-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { ResourceIcon, getResourceLabel, type Resource, type ResourceType } from '@datagouv/components-next'
import { RiArrowRightSLine, RiArrowLeftSLine } from '@remixicon/vue'

export interface ResourceGroup {
  type: ResourceType
  total: number
  items: Resource[]
}

defineProps<{
  resources: ResourceGroup[]
  selectedResourceId: string | null
  collapsed: boolean
  search: string
}>()

defineEmits<{
  'select': [resource: Resource]
  'load-more': [type: ResourceType]
  'update:collapsed': [value: boolean]
  'update:search': [value: string]
}>()

const searchId = useId()
</script>
