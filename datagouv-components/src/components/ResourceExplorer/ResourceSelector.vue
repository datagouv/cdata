<template>
  <Popover
    v-slot="{ open, close }"
    class="relative inline-block"
  >
    <slot
      name="trigger"
      :open="open"
    >
      <PopoverButton
        class="inline-flex items-center justify-center size-6 rounded text-gray-plain hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-new-primary"
        :aria-label="t('Choisir une autre ressource')"
      >
        <RiArrowDownSLine
          class="size-4"
          :class="{ 'rotate-180': open }"
          aria-hidden="true"
        />
      </PopoverButton>
    </slot>
    <PopoverPanel
      :class="searchable
        ? 'absolute left-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-default rounded shadow-lg p-3 space-y-2'
        : 'absolute left-0 top-full z-50 mt-1 w-80 max-h-96 overflow-auto bg-white border border-gray-default rounded shadow-lg p-1'"
    >
      <input
        v-if="searchable"
        v-model="searchQuery"
        type="search"
        class="w-full border border-gray-default rounded px-2.5 py-1.5 text-sm"
        :placeholder="t('Rechercher dans les ressources…')"
      >
      <ul
        v-if="filteredResources.length > 0"
        class="list-none p-0 m-0 space-y-0.5 max-h-80 overflow-y-auto"
      >
        <li
          v-for="r in filteredResources"
          :key="r.id"
        >
          <ResourceListItem
            :resource="r"
            :to="resourceTo(r)"
            :replace
            :selected="r.id === selectedId"
            :disabled="isDisabled?.(r)"
            :disabled-title="disabledTitle"
            @click="close()"
          />
        </li>
      </ul>
      <p
        v-else
        class="text-sm text-gray-medium italic mb-0 px-2 py-2"
      >
        {{ t('Aucune ressource correspondante') }}
      </p>
    </PopoverPanel>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import ResourceListItem from '../ResourceListItem.vue'
import type { Resource } from '../../types/resources'

const props = defineProps<{
  resources: Resource[]
  selectedId: string
  resourceTo: (resource: Resource) => RouteLocationRaw
  searchable?: boolean
  isDisabled?: (resource: Resource) => boolean
  disabledTitle?: string
  replace?: boolean
}>()

const { t } = useTranslation()

const searchQuery = ref('')

const filteredResources = computed(() => {
  if (!props.searchable) return props.resources
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.resources
  return props.resources.filter(r => (r.title ?? '').toLowerCase().includes(q))
})
</script>
