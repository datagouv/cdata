<template>
  <aside
    v-if="!collapsed"
    class="w-72 shrink-0 border-l border-gray-default pl-4"
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
        v-model="search"
        type="search"
        class="w-full border border-gray-default rounded px-2.5 py-1.5 text-sm"
        :placeholder="$t('Rechercher')"
      >
    </div>

    <div class="space-y-4 overflow-y-auto max-h-[60vh]">
      <div
        v-for="group in filteredGroups"
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
import { computed, useId } from 'vue'
import { ResourceIcon, getResourceLabel, type Resource, type ResourceType } from '@datagouv/components-next'
import { RiArrowRightSLine, RiArrowLeftSLine } from '@remixicon/vue'

export interface ResourceGroup {
  type: ResourceType
  items: Resource[]
}

const props = defineProps<{
  resources: ResourceGroup[]
  selectedResourceId: string | null
  collapsed: boolean
}>()

defineEmits<{
  'select': [resource: Resource]
  'update:collapsed': [value: boolean]
}>()

const searchId = useId()
const search = ref('')

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return props.resources.filter(g => g.items.length > 0)
  return props.resources
    .map(group => ({
      ...group,
      items: group.items.filter(r =>
        (r.title || '').toLowerCase().includes(q),
      ),
    }))
    .filter(g => g.items.length > 0)
})
</script>
