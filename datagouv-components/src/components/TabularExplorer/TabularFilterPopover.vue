<template>
  <Popover
    v-slot="{ open }"
    ref="popover"
    class="relative shrink-0"
  >
    <PopoverButton class="p-0.5 rounded hover:bg-gray-100 focus:outline-none">
      <RiFilter2Line
        class="size-3.5"
        aria-hidden="true"
      />
      <span class="sr-only">{{ t('Filtrer') }} {{ column }}</span>
    </PopoverButton>

    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-show="open"
          ref="panel"
          class="bg-white border border-black/10 rounded-lg shadow-md w-64 absolute z-[800]"
          :style="floatingStyles"
          static
        >
          <!-- Title -->
          <div class="px-3 py-2 border-b border-black/10">
            <p class="text-sm font-medium mb-0">
              {{ t('Filtrer') }} : {{ column }}
            </p>
          </div>

          <!-- Sort -->
          <div class="flex items-center gap-1 px-2 py-1.5 border-b border-black/10 text-xs">
            <span class="text-[#3A3A3A]">{{ t('Trier') }}</span>
            <BrandedButton
              color="tertiary"
              size="2xs"
              :icon="RiArrowUpLine"
              keep-margins-even-without-borders
            >
              {{ t('Croissant') }}
            </BrandedButton>
            <BrandedButton
              color="tertiary"
              size="2xs"
              :icon="RiArrowDownLine"
              keep-margins-even-without-borders
            >
              {{ t('Décroissant') }}
            </BrandedButton>
          </div>

          <!-- Null stats -->
          <div
            v-if="columnProfile && columnProfile.nb_missing_values > 0"
            class="px-3 py-2 border-b border-black/10 text-[11px] text-gray-medium"
          >
            {{ columnProfile.nb_missing_values }} null
            ({{ nullPercent }})
          </div>

          <!-- Categorical values -->
          <template v-if="columnType === 'categorical' && columnProfile?.tops">
            <div class="px-3 py-2 border-b border-black/10">
              <div class="relative">
                <RiSearchLine
                  class="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-medium"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  class="w-full h-8 text-sm border border-transparent rounded-lg py-1 pl-8 pr-3 bg-[#f3f3f5] focus:outline-none focus:border-blue-main"
                  :placeholder="t('Rechercher...')"
                >
              </div>
            </div>
            <div class="max-h-56 overflow-auto p-1">
              <label
                v-for="top in columnProfile.tops"
                :key="top.value"
                class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  class="size-4 rounded shrink-0 accent-blue-main"
                >
                <span class="truncate font-medium">{{ top.value ?? 'null' }}</span>
                <span class="ml-auto text-[#717182] font-medium shrink-0">{{ top.count }}</span>
              </label>
            </div>
          </template>
        </PopoverPanel>
      </Teleport>
    </ClientOnly>
  </Popover>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import {
  RiFilter2Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSearchLine,
} from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import BrandedButton from '../BrandedButton.vue'
import ClientOnly from '../ClientOnly.vue'
import type { TabularColumnProfile, ColumnType } from './types'

defineProps<{
  column: string
  columnType: ColumnType
  columnProfile: TabularColumnProfile | null
  nullPercent: string
}>()

const { t } = useTranslation()

const popoverRef = useTemplateRef<InstanceType<typeof Popover>>('popover')
const panelRef = useTemplateRef<InstanceType<typeof PopoverPanel>>('panel')

const { floatingStyles } = useFloating(popoverRef, panelRef, {
  placement: 'bottom-start',
  middleware: [flip(), shift()],
  whileElementsMounted: autoUpdate,
})
</script>
