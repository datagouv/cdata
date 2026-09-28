<template>
  <Popover
    v-slot="{ open, close }"
    class="relative inline-block"
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
    <PopoverPanel class="absolute left-0 top-full z-50 mt-1 w-80 max-h-96 overflow-auto bg-white border border-gray-default rounded shadow-lg p-1">
      <ul class="list-none p-0 m-0 space-y-0.5 max-h-80 overflow-y-auto">
        <li
          v-for="r in resources"
          :key="r.id"
        >
          <ResourceListItem
            :resource="r"
            :to="resourceTo(r)"
            :replace
            :selected="r.id === selectedId"
            @click="close()"
          />
        </li>
      </ul>
    </PopoverPanel>
  </Popover>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import ResourceListItem from '../ResourceListItem.vue'
import type { Resource } from '../../types/resources'

defineProps<{
  resources: Resource[]
  selectedId: string
  resourceTo: (resource: Resource) => RouteLocationRaw
  replace?: boolean
}>()

const { t } = useTranslation()
</script>
