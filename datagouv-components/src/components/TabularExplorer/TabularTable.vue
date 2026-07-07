<template>
  <div>
    <!-- No column selected -->
    <div
      v-if="displayedColumns.length === 0"
      class="flex flex-col items-center py-12"
    >
      <img
        :src="noColumnsSrc"
        class="h-32"
        alt=""
      >
      <p class="font-bold text-gray-title my-3">
        {{ t('Aucune colonne sélectionnée') }}
      </p>
      <BrandedButton
        color="secondary"
        size="xs"
        @click="showAllColumns"
      >
        {{ t('Afficher toutes les colonnes') }}
      </BrandedButton>
    </div>

    <!-- Desktop: scrollable table. `-mx-4` cancels the host's 1rem padding so the
         table reaches the panel edge (until the panel stops padding it). -->
    <div
      v-if="displayedColumns.length > 0"
      ref="scrollContainer"
      class="hidden md:block overflow-auto max-h-[70vh] -mx-4"
    >
      <table class="text-sm border-collapse">
        <thead class="sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_0_#E5E5E5]">
          <tr class="border-b border-gray-default">
            <th
              v-for="col in displayedColumns"
              :key="col"
              class="group/th relative h-14 px-2 last:pr-5 text-left align-middle whitespace-nowrap border-r border-gray-default last:border-r-0"
              :style="columnWidths[col] ? { width: columnWidths[col] + 'px', minWidth: columnWidths[col] + 'px', maxWidth: columnWidths[col] + 'px' } : { maxWidth: '300px' }"
            >
              <div class="flex items-center gap-0.5 min-w-0">
                <span
                  class="font-extrabold text-sm truncate"
                  :title="col"
                >{{ col }}</span>
                <RiArrowUpLine
                  v-if="sort?.column === col && sort.direction === 'asc'"
                  class="size-3.5 shrink-0 text-new-primary"
                  aria-hidden="true"
                />
                <RiArrowDownLine
                  v-else-if="sort?.column === col && sort.direction === 'desc'"
                  class="size-3.5 shrink-0 text-new-primary"
                  aria-hidden="true"
                />
                <TabularFilterPopover
                  v-model:sort="sort"
                  v-model:filters="filters"
                  class="mt-1"
                  :column="col"
                  :column-type="getColumnType(col)"
                  :column-profile="getColumnProfile(col)"
                  :null-percent="getNullPercent(col)"
                  :total-lines="totalLines"
                  :category-badge-styles="getColumnType(col) === 'categorical' ? getCategoryBadgeStylesForColumn(col) : undefined"
                  :boolean-counts="getColumnType(col) === 'boolean' ? getBooleanCounts(col) : undefined"
                />
              </div>
              <!-- Column type (semantic format when available) -->
              <span class="font-mono text-xs text-gray-plain -mt-0.5 inline-flex items-center gap-1 max-w-full">
                <component
                  :is="getColumnDisplay(col).icon"
                  class="size-3 shrink-0"
                  aria-hidden="true"
                />
                <span class="mt-px truncate">{{ getColumnDisplay(col).label }}</span>
              </span>
              <!-- Resize handle: wide hit zone, thin visible bar -->
              <div
                class="absolute top-0 bottom-0 w-3 z-20 cursor-col-resize group/resize"
                :class="col === displayedColumns[displayedColumns.length - 1] ? 'right-3' : '-right-1.5'"
                @mousedown.prevent="startResize(col, $event)"
              >
                <div
                  class="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-primary/40 opacity-0 group-hover/resize:opacity-100"
                  :class="{ '!opacity-100': resizing?.column === col }"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="allRows.length === 0">
            <td
              :colspan="displayedColumns.length"
              class="py-16 text-center"
            >
              <div class="flex flex-col items-center gap-2">
                <RiSearchLine
                  class="size-8 text-gray-low"
                  aria-hidden="true"
                />
                <span class="text-sm text-gray-low">{{ t('Aucun résultat trouvé.') }}</span>
              </div>
            </td>
          </tr>
          <tr
            v-for="(row, i) in allRows"
            :key="row.__id ?? i"
            class="border-b border-gray-default even:bg-gray-lowest-2 hover:bg-gray-100"
          >
            <td
              v-for="col in displayedColumns"
              :key="col"
              data-cell
              class="p-2 align-middle whitespace-nowrap border-r border-gray-default last:border-r-0 overflow-hidden cursor-pointer hover:bg-gray-200/50"
              :class="{ 'text-right font-mono tabular-nums text-sm': getColumnType(col) === 'number' || getColumnType(col) === 'date' }"
              :style="columnWidths[col] ? { maxWidth: columnWidths[col] + 'px' } : { maxWidth: '300px' }"
              @click="onCellClick(col, row[col], $event)"
            >
              <TabularCell
                :value="row[col]"
                :column-type="getColumnType(col)"
                :category-badge-style="getColumnType(col) === 'categorical' ? getCategoryBadgeStyle(col, String(row[col])) : undefined"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <InfiniteLoader
        v-if="hasMore"
        :root="scrollContainerRef"
        @intersect="loadNextPage"
      />
    </div>

    <!-- Cell popover -->
    <TabularCellPopover
      v-model:cell="activeCell"
      v-model:filters="filters"
    />

    <!-- Mobile: card layout -->
    <div
      v-if="displayedColumns.length > 0"
      class="md:hidden space-y-2 px-1"
    >
      <div
        v-if="allRows.length === 0"
        class="py-16 text-center"
      >
        <div class="flex flex-col items-center gap-2">
          <RiSearchLine
            class="size-8 text-gray-low"
            aria-hidden="true"
          />
          <span class="text-sm text-gray-low">{{ t('Aucun résultat trouvé.') }}</span>
        </div>
      </div>
      <div
        v-for="(row, i) in allRows"
        :key="row.__id ?? i"
        class="border border-gray-default rounded-lg p-3 space-y-2"
        :class="i % 2 === 1 ? 'bg-gray-lowest-2' : 'bg-white'"
      >
        <div
          v-for="col in mobileVisibleFields(i)"
          :key="col"
          class="flex flex-col gap-0.5 min-w-0"
        >
          <div class="flex items-center gap-1 min-w-0">
            <component
              :is="getColumnDisplay(col).icon"
              class="size-3 text-gray-low shrink-0"
              aria-hidden="true"
            />
            <span
              class="text-xs text-gray-plain truncate"
              :title="col"
            >{{ col }}</span>
          </div>
          <div
            data-cell
            class="min-w-0 pl-4 cursor-pointer"
            @click="onCellClick(col, row[col], $event)"
          >
            <TabularCell
              :value="row[col]"
              :column-type="getColumnType(col)"
              :category-badge-style="getColumnType(col) === 'categorical' ? getCategoryBadgeStyle(col, String(row[col])) : undefined"
              compact
            />
          </div>
        </div>
        <button
          v-if="displayedColumns.length > 4"
          class="text-xs text-gray-title hover:underline pt-1 flex items-center gap-1"
          @click="toggleMobileExpand(i)"
        >
          <RiArrowDownSLine
            class="size-3 transition-transform"
            :class="{ 'rotate-180': mobileExpandedRows.has(i) }"
            aria-hidden="true"
          />
          {{ mobileExpandedRows.has(i) ? t('Moins') : `+${displayedColumns.length - 4} ${t('champs')}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import { RiArrowDownLine, RiArrowDownSLine, RiArrowUpLine, RiSearchLine } from '@remixicon/vue'
import BrandedButton from '../BrandedButton.vue'
import InfiniteLoader from '../InfiniteLoader.vue'
import TabularCell from './TabularCell.vue'
import TabularCellPopover, { type CellInfo } from './TabularCellPopover.vue'
import TabularFilterPopover from './TabularFilterPopover.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'
import noColumnsSrc from '../../../assets/illustrations/_table.svg?url'

const { t } = useTranslation()
const {
  tableData,
  allRows,
  hasMore,
  loadNextPage,
  totalLines,
  sort,
  filters,
  displayedColumns,
  showAllColumns,
  columnTypesMap,
  getColumnType,
  getColumnProfile,
  getColumnDisplay,
  getNullPercent,
  getCategoryBadgeStyle,
  getCategoryBadgeStylesForColumn,
  getBooleanCounts,
} = useTabularContext()

// Column widths (table-only, never needed outside the table).
//
// Strategy:
// - `naturalWidths` holds each column's content-driven width, measured ONCE from the
//   DOM while the <th> are still auto-sized. Stable base, never re-measured.
// - `columnWidths` is the applied result: `naturalWidths` distributed to fill the
//   container. Recomputed whenever the displayed column set changes.
// - Manual resize writes directly to `columnWidths` during the drag, then stores the
//   final width back into `naturalWidths` so it survives later redistribution.
const scrollContainerRef = useTemplateRef<HTMLElement>('scrollContainer')
const columnWidths = ref<Record<string, number>>({})
const naturalWidths = ref<Record<string, number>>({})
const resizing = ref<{ column: string, startX: number, startWidth: number } | null>(null)

function measureNaturalWidths() {
  const container = scrollContainerRef.value
  if (!container) return
  const ths = container.querySelectorAll('th')
  if (!ths || ths.length === 0) return

  const widths: Record<string, number> = {}
  ths.forEach((th, i) => {
    const col = displayedColumns.value[i]
    if (col) widths[col] = th.offsetWidth
  })
  naturalWidths.value = widths
}

function redistributeColumnWidths() {
  const container = scrollContainerRef.value
  if (!container) return
  const cols = displayedColumns.value
  let naturalSum = 0
  for (const col of cols) naturalSum += naturalWidths.value[col] ?? 0
  if (naturalSum === 0) return

  const ratio = naturalSum < container.clientWidth ? container.clientWidth / naturalSum : 1
  const widths: Record<string, number> = {}
  for (const col of cols) widths[col] = Math.floor((naturalWidths.value[col] ?? 0) * ratio)
  columnWidths.value = widths
}

function ensureMeasured() {
  if (Object.keys(naturalWidths.value).length > 0) return
  if (displayedColumns.value.length === 0) return
  measureNaturalWidths()
  redistributeColumnWidths()
}

const { width: containerWidth } = useElementSize(scrollContainerRef)

watch(containerWidth, (width) => {
  if (width === 0) return
  if (Object.keys(naturalWidths.value).length === 0) {
    ensureMeasured()
  }
  else {
    redistributeColumnWidths()
  }
})

// Fallback: re-run once columns appear if they weren't available when the container
// was first sized (profile resolving late).
watch(
  () => [tableData.value !== null, displayedColumns.value.length] as const,
  async ([dataReady, colCount]) => {
    if (!dataReady || colCount === 0) return
    if (Object.keys(naturalWidths.value).length > 0) return
    await nextTick()
    ensureMeasured()
  },
)

// Re-stretch the remaining columns whenever the displayed set changes.
watch(displayedColumns, async () => {
  if (Object.keys(naturalWidths.value).length === 0) return
  await nextTick()
  redistributeColumnWidths()
})

function startResize(col: string, e: MouseEvent) {
  if (!Object.keys(naturalWidths.value).length) {
    measureNaturalWidths()
    redistributeColumnWidths()
  }
  resizing.value = { column: col, startX: e.clientX, startWidth: columnWidths.value[col] ?? 100 }
  if (scrollContainerRef.value) scrollContainerRef.value.style.scrollBehavior = 'auto'
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!resizing.value) return
  const container = scrollContainerRef.value
  // Auto-scroll when the mouse approaches the right edge, adjusting startX to compensate.
  if (container) {
    const rect = container.getBoundingClientRect()
    const distFromRight = rect.right - e.clientX
    if (distFromRight < 50) {
      const oldScroll = container.scrollLeft
      container.scrollLeft += Math.max(1, (50 - distFromRight) * 0.5)
      resizing.value.startX -= container.scrollLeft - oldScroll
    }
  }
  const delta = e.clientX - resizing.value.startX
  const newWidth = Math.max(60, resizing.value.startWidth + delta)
  columnWidths.value = { ...columnWidths.value, [resizing.value.column]: newWidth }
}

function stopResize() {
  if (scrollContainerRef.value) scrollContainerRef.value.style.scrollBehavior = ''
  if (resizing.value) {
    const col = resizing.value.column
    const width = columnWidths.value[col]
    if (width != null) naturalWidths.value = { ...naturalWidths.value, [col]: width }
  }
  resizing.value = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

// Cell popover (table-only)
const activeCell = ref<CellInfo | null>(null)

function onCellClick(col: string, value: unknown, event: MouseEvent) {
  const el = (event.target as HTMLElement).closest('[data-cell]') as HTMLElement | null
  if (!el) return
  if (activeCell.value && activeCell.value.element === el) {
    activeCell.value = null
    return
  }
  activeCell.value = { column: col, columnType: columnTypesMap.value[col] ?? 'text', value, element: el }
}

// Mobile row expansion (table-only)
const mobileExpandedRows = ref(new Set<number>())

function mobileVisibleFields(index: number): string[] {
  if (displayedColumns.value.length <= 4 || mobileExpandedRows.value.has(index)) {
    return displayedColumns.value
  }
  return displayedColumns.value.slice(0, 4)
}

function toggleMobileExpand(index: number) {
  const next = new Set(mobileExpandedRows.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  mobileExpandedRows.value = next
}
</script>
