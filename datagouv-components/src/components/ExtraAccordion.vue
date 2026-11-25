<template>
  <Disclosure
    v-slot="{ open }"
    as="div"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <component
          :is="titleLevel"
          class="m-0 text-sm/5 font-medium uppercase text-gray-title"
        >
          {{ titleText }}
        </component>
      </div>
      <div class="flex items-center gap-2">
        <slot name="buttons" />
        <DisclosureButton
          :as="BrandedButton"
          color="tertiary"
          keep-margins-even-without-borders
          :icon="open ? RiArrowUpSLine : RiArrowDownSLine"
        >
          {{ buttonText }}

          <span
            v-if="open"
            class="sr-only"
          >
            {{ t('Fermer les détails') }}
          </span>
        </DisclosureButton>
      </div>
    </header>
    <DisclosurePanel
      :id="accordionId"
      class="pt-6"
    >
      <div>
        <div
          class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2"
          data-testid="extra-list"
        >
          <div
            v-for="(value, key) in extra"
            :key="key"
            class="min-w-0"
          >
            <h3 class="m-0 mb-1 text-sm/5 font-normal text-gray-secondary [overflow-wrap:anywhere]">
              {{ key }}
            </h3>
            <CopyButton
              class="max-w-full"
              :text="display(value)"
              :label="t('Copier {key}', { key })"
              :copied-label="t('Copié')"
              variant="inline"
            >
              <span class="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {{ display(value) }}
              </span>
            </CopyButton>
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
import CopyButton from './CopyButton.vue'
import { useTranslation } from '../composables/useTranslation'

const accordionId = useId()
const { t } = useTranslation()

defineProps<{
  buttonText: string
  titleText: string
  extra: Record<string, unknown>
  titleLevel: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}>()

function display(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null) return 'null'
  if (value === undefined) return '—'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    }
    catch {
      return String(value)
    }
  }
  return String(value)
}
</script>
