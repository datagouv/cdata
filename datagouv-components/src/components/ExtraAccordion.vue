<template>
  <Disclosure
    v-slot="{ open }"
    as="div"
  >
    <header
      class="flex flex-wrap items-center pb-6 mb-6 border-bottom border-gray-default"
    >
      <div class="fr-col">
        <component
          :is="titleLevel"
          class="subtitle subtitle--uppercase fr-m-0"
        >
          {{ titleText }}
        </component>
      </div>
      <div class="fr-col-auto space-x-4">
        <slot name="buttons" />
        <DisclosureButton
          :as="BrandedButton"
          color="secondary-softer"
          keep-margins-even-without-borders
          :icon="open ? RiArrowUpSLine : RiArrowDownSLine"
        >
          {{ buttonText }}

          <span
            v-if="open"
            class="sr-only"
          >
            {{ $t('Close details') }}
          </span>
        </DisclosureButton>
      </div>
    </header>
    <DisclosurePanel
      :id="accordionId"
      class="accordion-content"
    >
      <div class="pb-6 mb-6 border-bottom border-gray-default">
        <div
          class="fr-grid-row fr-grid-row--gutters fr-text--sm fr-m-0"
          data-testid="extra-list"
        >
          <div
            v-for="(value, key) in extra"
            :key="key"
            class="fr-col-12 fr-col-sm-6 fr-col-md-4"
          >
            <h3 class="subtitle fr-mb-1v">
              {{ key }}
            </h3>
            <p class="text-sm m-0 text-gray-medium break-all">
              {{ value }}
            </p>
          </div>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/vue'
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/vue'
import BrandedButton from './BrandedButton.vue'

const accordionId = useId()

defineProps<{
  buttonText: string
  titleText: string
  extra: Record<string, unknown>
  titleLevel: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}>()
</script>
