<template>
  <Disclosure
    v-slot="{ open }"
    as="section"
    data-type="accordion"
    class="border-t last:border-b border-y-gray-default py-2.5"
  >
    <div class="flex flex-wrap items-center">
      <h2 class="!text-sm uppercase !mb-0 w-full flex-none md:flex-1">
        {{ title }}
      </h2>
      <div class="flex-none flex flex-wrap items-center gap-2">
        <slot name="buttons" />
        <DisclosureButton
          :as="BrandedButton"
          color="tertiary"
          keep-margins-even-without-borders
          :icon="RiArrowDownSLine"
          :icon-attrs="{ class: open ? 'rotate-180 transform' : '' }"
        >
          {{ buttonText }}
        </DisclosureButton>
      </div>
    </div>
    <DisclosurePanel
      class="pt-2.5 pb-5"
    >
      <slot />
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'

defineProps<{
  buttonText: string
  title: string
}>()
</script>
