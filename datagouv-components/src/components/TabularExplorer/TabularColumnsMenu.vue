<template>
  <Popover
    ref="columnAnchor"
    v-slot="{ open }"
    class="relative"
  >
    <PopoverButton class="flex items-center gap-1.5 text-xs text-gray-plain rounded px-2 py-1 hover:bg-gray-50 focus:outline-none">
      <RiLayoutColumnLine
        class="size-3"
        aria-hidden="true"
      />
      <span class="font-bold hidden md:inline">{{ t('Colonnes') }}</span>
      <span class="font-mono tabular-nums">{{ visibleColumns.size }}/{{ allColumns.length }}</span>
      <RiArrowDownSLine
        class="size-3 opacity-50"
        aria-hidden="true"
      />
    </PopoverButton>

    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-show="open"
          ref="columnPanel"
          static
          class="bg-white border border-gray-default rounded shadow-lg w-72 absolute z-[800]"
          :style="columnFloatingStyles"
        >
          <div class="px-3 py-2 border-b border-gray-default space-y-1.5">
            <span class="block text-xs font-medium text-gray-title">
              {{ visibleColumns.size }} {{ t('sur') }} {{ allColumns.length }} {{ t('colonnes visibles') }}
            </span>
            <div class="flex items-center gap-1">
              <BrandedButton
                v-if="hiddenCount"
                color="tertiary"
                size="2xs"
                @click="showAllColumns"
              >
                {{ t('Tout afficher') }}
              </BrandedButton>
              <BrandedButton
                v-if="visibleColumns.size > 0"
                color="tertiary"
                size="2xs"
                @click="hideAllColumns"
              >
                {{ t('Tout masquer') }}
              </BrandedButton>
            </div>
          </div>
          <div class="max-h-64 overflow-auto p-1">
            <div
              v-for="col in allColumns"
              :key="col"
              class="group/col flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-xs"
            >
              <label class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="visibleColumns.has(col)"
                  class="size-3.5 accent-new-primary"
                  @change="toggleColumn(col)"
                >
                <span class="truncate">{{ col }}</span>
              </label>
              <button
                class="shrink-0 px-1 text-new-primary hover:underline hidden group-hover/col:block group-focus-within/col:block"
                @click="selectOnlyColumn(col)"
              >
                {{ t('Uniquement') }}
              </button>
            </div>
          </div>
        </PopoverPanel>
      </Teleport>
    </ClientOnly>
  </Popover>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { autoUpdate, flip, shift, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiArrowDownSLine, RiLayoutColumnLine } from '@remixicon/vue'
import ClientOnly from '../ClientOnly.vue'
import BrandedButton from '../BrandedButton.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

const { t } = useTranslation()
const {
  allColumns,
  visibleColumns,
  hiddenCount,
  toggleColumn,
  showAllColumns,
  hideAllColumns,
  selectOnlyColumn,
} = useTabularContext()

// The panel is teleported, so it's positioned against its trigger with floating-ui.
const columnAnchor = useTemplateRef<InstanceType<typeof Popover>>('columnAnchor')
const columnPanel = useTemplateRef<InstanceType<typeof PopoverPanel>>('columnPanel')
const columnAnchorEl = computed(() => columnAnchor.value?.$el as HTMLElement | undefined)
const columnPanelEl = computed(() => columnPanel.value?.$el as HTMLElement | undefined)
const { floatingStyles: columnFloatingStyles } = useFloating(columnAnchorEl, columnPanelEl, {
  placement: 'bottom-start',
  middleware: [flip(), shift()],
  whileElementsMounted: autoUpdate,
})
</script>
