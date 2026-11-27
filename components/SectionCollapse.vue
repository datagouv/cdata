<template>
  <Disclosure
    v-slot="{ open }"
    as="section"
    data-type="accordion"
    class="border-t border-y-gray-default py-4 last:border-b"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="!m-0 w-full flex-none !text-sm/5 font-medium uppercase text-gray-title md:flex-1">
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
      class="pt-6"
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
