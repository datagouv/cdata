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
    <PopoverPanel
      class="absolute left-0 top-full z-50 mt-1 w-80 max-h-96 overflow-auto bg-white border border-gray-default rounded shadow-lg p-1"
    >
      <button
        v-for="r in resources"
        :key="r.id"
        type="button"
        class="flex items-start gap-2 w-full text-left px-2 py-2 rounded text-sm hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
        :class="{ 'bg-blue-50': r.id === selectedId }"
        @click="emit('select', r); close()"
      >
        <ResourceIcon
          :resource="r"
          class="size-4 mt-0.5 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div
            class="font-medium truncate"
            :class="{ 'text-new-primary': r.id === selectedId }"
          >
            {{ r.title || t('Fichier sans nom') }}
          </div>
          <div
            v-if="r.format"
            class="text-xs text-gray-medium uppercase"
          >
            {{ r.format }}
          </div>
        </div>
      </button>
    </PopoverPanel>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import ResourceIcon from '../ResourceAccordion/ResourceIcon.vue'
import type { Resource } from '../../types/resources'

defineProps<{
  resources: Resource[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [resource: Resource]
}>()

const { t } = useTranslation()
</script>
