<template>
  <Popover
    ref="anchor"
    v-slot="{ open }"
    class="relative shrink-0"
  >
    <PopoverButton
      class="p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-new-primary"
      :class="hasColumnFilter ? 'bg-primary text-white' : 'hover:bg-gray-100'"
    >
      <RiFilterLine
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
          static
          class="bg-white border border-black/10 rounded-lg shadow-md w-64 absolute z-[800]"
          :style="floatingStyles"
        >
          <!-- Title -->
          <div class="flex items-center justify-between px-3 py-2 border-b border-black/10">
            <p class="text-sm font-medium mb-0">
              {{ t('Filtrer') }} : {{ column }}
            </p>
            <BrandedButton
              v-if="hasColumnFilter"
              color="tertiary"
              size="2xs"
              :icon="RiCloseLine"
              @click="clearColumnFilter"
            >
              {{ t('Effacer') }}
            </BrandedButton>
          </div>

          <TabularFilterContent
            v-model:sort="sort"
            v-model:filters="filters"
            :column="column"
            :column-type="columnType"
            :column-profile="columnProfile"
            :null-percent="nullPercent"
            :total-lines="totalLines"
            :category-badge-styles="categoryBadgeStyles"
            :boolean-counts="booleanCounts"
          />
        </PopoverPanel>
      </Teleport>
    </ClientOnly>
  </Popover>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { RiFilterLine, RiCloseLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import { hasFilterForColumn as _hasFilterForColumn } from '../../functions/tabular'
import BrandedButton from '../BrandedButton.vue'
import ClientOnly from '../ClientOnly.vue'
import TabularFilterContent from './TabularFilterContent.vue'
import type { TabularColumnProfile, ColumnType, ColumnFilters, SortConfig, BadgeStyle } from './types'

const props = defineProps<{
  column: string
  columnType: ColumnType
  columnProfile: TabularColumnProfile | null
  nullPercent: string
  totalLines: number
  categoryBadgeStyles?: Record<string, BadgeStyle>
  booleanCounts?: { trueCount: number, falseCount: number }
}>()

const sort = defineModel<SortConfig | null>('sort')
const filters = defineModel<Record<string, ColumnFilters>>('filters', { default: () => ({}) })

const { t } = useTranslation()

// Headless UI Popover manages open state, Escape-to-close, outside-click,
// focus handling and ARIA. floating-ui only positions the teleported panel.
const anchorComponent = useTemplateRef<InstanceType<typeof Popover>>('anchor')
const panelComponent = useTemplateRef<InstanceType<typeof PopoverPanel>>('panel')
const anchorEl = computed(() => anchorComponent.value?.$el as HTMLElement | undefined)
const panelEl = computed(() => panelComponent.value?.$el as HTMLElement | undefined)

const hasColumnFilter = computed(() => _hasFilterForColumn(filters.value, props.column))

function clearColumnFilter() {
  const { [props.column]: _, ...rest } = filters.value
  filters.value = rest
}

const { floatingStyles } = useFloating(anchorEl, panelEl, {
  placement: 'bottom-start',
  middleware: [flip(), shift()],
  whileElementsMounted: autoUpdate,
})
</script>
