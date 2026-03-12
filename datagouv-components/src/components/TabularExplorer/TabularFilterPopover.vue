<template>
  <div
    ref="anchor"
    class="relative shrink-0"
  >
    <button
      class="p-0.5 rounded focus:outline-none"
      :class="hasColumnFilter ? 'bg-primary text-white' : 'hover:bg-gray-100'"
      @click.stop="togglePopover"
    >
      <RiFilter2Line
        class="size-3.5"
        aria-hidden="true"
      />
      <span class="sr-only">{{ t('Filtrer') }} {{ column }}</span>
    </button>

    <ClientOnly>
      <Teleport to="#tooltips">
        <div
          v-show="isOpen"
          ref="panel"
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
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { RiFilter2Line, RiCloseLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import BrandedButton from '../BrandedButton.vue'
import ClientOnly from '../ClientOnly.vue'
import TabularFilterContent from './TabularFilterContent.vue'
import type { TabularColumnProfile, ColumnType, ColumnFilters, SortConfig } from './types'

const props = defineProps<{
  column: string
  columnType: ColumnType
  columnProfile: TabularColumnProfile | null
  nullPercent: string
  totalLines: number
  categoryBadgeStyles?: Record<string, { backgroundColor: string, color: string }>
  booleanCounts?: { trueCount: number, falseCount: number }
}>()

const sort = defineModel<SortConfig | null>('sort')
const filters = defineModel<Record<string, ColumnFilters>>('filters', { default: () => ({}) })

const { t } = useTranslation()

const isOpen = ref(false)

function togglePopover() {
  isOpen.value = !isOpen.value
}

const anchorRef = useTemplateRef<HTMLElement>('anchor')
const panelRef = useTemplateRef<HTMLElement>('panel')

function onClickOutside(e: MouseEvent) {
  if (!isOpen.value) return
  const anchor = anchorRef.value
  const panel = panelRef.value
  if (anchor && anchor.contains(e.target as Node)) return
  if (panel && panel.contains(e.target as Node)) return
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})

const hasColumnFilter = computed(() => {
  const f = filters.value[props.column]
  if (!f) return false
  return !!(f.in?.length || f.exact != null || f.contains || f.null || f.min != null || f.max != null)
})

function clearColumnFilter() {
  const { [props.column]: _, ...rest } = filters.value
  filters.value = rest
}

const { floatingStyles } = useFloating(anchorRef, panelRef, {
  placement: 'bottom-start',
  middleware: [flip(), shift()],
  whileElementsMounted: autoUpdate,
})
</script>
