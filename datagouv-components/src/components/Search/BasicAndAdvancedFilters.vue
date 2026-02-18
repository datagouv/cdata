<template>
  <!-- [&_.fr-input-group]:!mb-0 disables DSFR margin-bottom since we use gap for spacing -->
  <div class="flex flex-col gap-4 [&_.fr-input-group]:!mb-0">
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
    <DisclosureButton class="flex w-[calc(100%+2rem)] items-center justify-between -mx-4 px-4 py-3 font-bold md:w-full md:mx-0 md:px-0 md:text-sm md:leading-tight md:mb-2">
      {{ t('Filtres avancés') }}
      <RiArrowDownSLine
        class="size-4 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </DisclosureButton>
    <DisclosurePanel class="flex flex-col gap-4 mt-4 [&_.fr-input-group]:!mb-0">
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
