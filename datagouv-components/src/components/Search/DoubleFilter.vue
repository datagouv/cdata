<template>
  <div class="flex flex-col">
    <slot
      :is-enabled="isBasicFilter"
      :get-order="getBasicOrder"
    />
  </div>

  <Disclosure
    v-if="advancedFilters.length"
    v-slot="{ open }"
    as="div"
    class="mt-4"
  >
    <DisclosureButton class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
      <RiArrowDownSLine
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': open }"
      />
      {{ t('Filtres avancés') }}
    </DisclosureButton>
    <DisclosurePanel class="flex flex-col mt-4">
      <slot
        :is-enabled="isAdvancedFilter"
        :get-order="getAdvancedOrder"
      />
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  basicFilters: string[]
  advancedFilters: string[]
}>()

const { t } = useTranslation()

const isBasicFilter = (name: string) => props.basicFilters.includes(name)
const isAdvancedFilter = (name: string) => props.advancedFilters.includes(name)

const getBasicOrder = (name: string) => props.basicFilters.indexOf(name)
const getAdvancedOrder = (name: string) => props.advancedFilters.indexOf(name)
</script>
