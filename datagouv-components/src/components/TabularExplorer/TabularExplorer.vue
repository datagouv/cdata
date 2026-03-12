<template>
  <div>
    <SimpleBanner
      v-if="error"
      type="warning"
      class="mb-4"
    >
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé.") }}
      <pre class="text-xs mt-2">{{ error }}</pre>
    </SimpleBanner>

    <template v-else-if="tableData && tableData.data.length">
      <!-- Toolbar -->
      <div class="flex items-center py-3 gap-2">
        <!-- Mobile: filter & sort button -->
        <BrandedButton
          class="md:hidden"
          color="tertiary"
          size="2xs"
          :icon="RiFilter2Line"
          keep-margins-even-without-borders
          @click="mobileFilterOpen = true"
        >
          {{ t('Filtres & tri') }}
        </BrandedButton>

        <div class="flex-1" />

        <!-- Right: Stats -->
        <div class="flex items-center gap-4">
          <!-- Colonnes (clickable, opens column popover) -->
          <Popover
            v-slot="{ open }"
            ref="columnPopover"
            class="relative"
          >
            <PopoverButton class="flex items-center gap-1.5 text-xs text-[#3A3A3A] rounded px-2 py-1 hover:bg-gray-50 focus:outline-none">
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
                  class="bg-white border border-gray-default rounded shadow-lg w-72 absolute z-[800]"
                  :style="columnFloatingStyles"
                  static
                >
                  <div class="flex items-center justify-between px-3 py-2 border-b border-gray-default">
                    <span class="text-xs font-medium text-gray-title">
                      {{ visibleColumns.size }} {{ t('sur') }} {{ allColumns.length }} {{ t('colonnes visibles') }}
                    </span>
                    <button
                      v-if="hiddenCount"
                      class="text-xs text-blue-main hover:underline"
                      @click="showAllColumns"
                    >
                      {{ t('Tout afficher') }}
                    </button>
                  </div>
                  <div class="max-h-64 overflow-auto p-1">
                    <label
                      v-for="col in allColumns"
                      :key="col"
                      class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        :checked="visibleColumns.has(col)"
                        class="size-3.5 accent-blue-main"
                        @change="toggleColumn(col)"
                      >
                      <span class="truncate">{{ col }}</span>
                    </label>
                  </div>
                </PopoverPanel>
              </Teleport>
            </ClientOnly>
          </Popover>

          <!-- Lignes -->
          <span class="flex items-center gap-1.5 text-xs text-[#3A3A3A]">
            <RiLayoutRowLine
              class="size-3 text-[#666]"
              aria-hidden="true"
            />
            <span class="font-bold hidden md:inline">{{ t('Lignes') }}</span>
            <span class="font-mono tabular-nums">{{ tableData.meta.total.toLocaleString() }}/{{ totalLines.toLocaleString() }}</span>
          </span>
        </div>
      </div>

      <!-- Active filters -->
      <div
        v-if="hasActiveFilters"
        class="bg-[#f6f6f6] border border-[#E5E5E5] rounded-[10px] px-3 py-2.5 mb-3 space-y-2.5"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <RiFilter2Line
              class="size-3.5"
              aria-hidden="true"
            />
            <span class="text-[11px] text-[#3A3A3A]">{{ t('Filtres actifs') }}</span>
            <span class="size-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] text-[#030213]">
              {{ activeFilters.length }}
            </span>
          </div>
          <button
            class="flex items-center gap-1 text-[10px] font-medium text-[#3A3A3A] hover:text-[#161616]"
            @click="clearAllFilters"
          >
            <RiCloseLine
              class="size-3"
              aria-hidden="true"
            />
            {{ t('Tout effacer') }}
          </button>
        </div>
        <!-- Chips -->
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="af in activeFilters"
            :key="af.column"
            class="inline-flex items-center gap-1.5 bg-white border border-[#CCC] rounded-lg pl-2 pr-1 py-1 text-[11px]"
          >
            <component
              :is="columnTypeIcon(af.column)"
              class="size-3 text-[#030213]"
              aria-hidden="true"
            />
            <span class="text-[#161616]">{{ af.column }}</span>
            <span class="text-[#3A3A3A]">{{ af.label }}</span>
            <button
              class="rounded p-0.5 text-[#929292] hover:text-[#3A3A3A] hover:bg-gray-100"
              @click="removeFilter(af.column)"
            >
              <RiCloseLine
                class="size-3"
                aria-hidden="true"
              />
              <span class="sr-only">{{ t('Supprimer ce filtre') }}</span>
            </button>
          </span>
        </div>
      </div>

      <!-- Desktop: scrollable table -->
      <div
        ref="scrollContainer"
        class="hidden md:block overflow-auto max-h-[70vh]"
      >
        <table class="text-sm border-collapse">
          <thead class="sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_0_#E5E5E5]">
            <tr class="border-b border-[#E5E5E5]">
              <th
                v-for="col in displayedColumns"
                :key="col"
                class="group/th relative h-14 px-2 text-left align-middle whitespace-nowrap border-r border-[#E5E5E5] last:border-r-0"
                :style="columnWidths[col] ? { width: columnWidths[col] + 'px', minWidth: columnWidths[col] + 'px', maxWidth: columnWidths[col] + 'px' } : undefined"
              >
                <div class="flex items-center gap-0.5 min-w-0">
                  <span
                    class="font-extrabold text-sm truncate"
                    :title="col"
                  >{{ col }}</span>
                  <RiArrowUpLine
                    v-if="sort?.column === col && sort.direction === 'asc'"
                    class="size-3.5 shrink-0 text-blue-main"
                    aria-hidden="true"
                  />
                  <RiArrowDownLine
                    v-else-if="sort?.column === col && sort.direction === 'desc'"
                    class="size-3.5 shrink-0 text-blue-main"
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
                  />
                </div>
                <!-- Column type -->
                <span class="font-mono text-[11px] text-[#3A3A3A] -mt-0.5 inline-flex items-center gap-1">
                  <component
                    :is="columnTypeIcon(col)"
                    class="size-3"
                    aria-hidden="true"
                  />
                  <span class="mt-px">{{ columnTypeLabel(col) }}</span>
                </span>
                <!-- Resize handle: wide hit zone, thin visible bar -->
                <div
                  class="absolute top-0 bottom-0 w-3 z-20 cursor-col-resize group/resize"
                  :class="col === displayedColumns[displayedColumns.length - 1] ? 'right-3' : '-right-1.5'"
                  @mousedown.prevent="startResize(col, $event)"
                >
                  <div
                    class="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-[#3558A2]/40 opacity-0 group-hover/resize:opacity-100"
                    :class="{ '!opacity-100': resizing?.column === col }"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in allRows"
              :key="row.__id ?? i"
              class="border-b border-[#E5E5E5] even:bg-[#FCFCFC] hover:bg-gray-100"
            >
              <td
                v-for="col in displayedColumns"
                :key="col"
                class="p-2 align-middle whitespace-nowrap border-r border-[#E5E5E5] last:border-r-0 overflow-hidden cursor-pointer hover:bg-gray-200/50"
                :class="{ 'text-right font-mono tabular-nums text-sm': getColumnType(col) === 'number' || getColumnType(col) === 'date' }"
                :style="columnWidths[col] ? { maxWidth: columnWidths[col] + 'px' } : undefined"
                @click="onCellClick(col, row[col], $event)"
              >
                <span
                  v-if="row[col] == null || row[col] === ''"
                  class="font-[Inconsolata,monospace] text-[#929292] italic text-sm"
                >null</span>
                <span v-else-if="getColumnType(col) === 'number'">{{ formatNumber(row[col]) }}</span>
                <span v-else-if="getColumnType(col) === 'date'">{{ formatDate(row[col]) }}</span>
                <span
                  v-else-if="getColumnType(col) === 'boolean'"
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px]"
                  :class="isTruthy(row[col]) ? 'bg-[#B8FEC9] text-[#18753C]' : 'bg-[#FFE9E6] text-[#CE0500]'"
                >
                  <span
                    class="size-2 rounded-full"
                    :class="isTruthy(row[col]) ? 'bg-[#18753C]' : 'bg-[#CE0500]'"
                  />
                  {{ isTruthy(row[col]) ? t('Vrai') : t('Faux') }}
                </span>
                <span
                  v-else-if="getColumnType(col) === 'categorical'"
                  class="inline-block rounded-[4px] font-medium px-2 py-0.5 text-xs max-w-full truncate"
                  :style="getCategoryBadgeStyle(col, String(row[col]))"
                >{{ row[col] }}</span>
                <span
                  v-else
                  class="text-[#161616] truncate block text-xs"
                >{{ row[col] }}</span>
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
      <div class="md:hidden space-y-2 px-1">
        <div
          v-for="(row, i) in allRows"
          :key="row.__id ?? i"
          class="border border-[#E5E5E5] rounded-lg p-3 space-y-2"
          :class="i % 2 === 1 ? 'bg-[#FCFCFC]' : 'bg-white'"
        >
          <div
            v-for="col in mobileVisibleFields(row, i)"
            :key="col"
            class="flex flex-col gap-0.5 min-w-0"
          >
            <div class="flex items-center gap-1 min-w-0">
              <component
                :is="columnTypeIcon(col)"
                class="size-3 text-[#929292] shrink-0"
                aria-hidden="true"
              />
              <span
                class="text-[11px] text-[#3A3A3A] truncate"
                :title="col"
              >{{ col }}</span>
            </div>
            <div
              class="min-w-0 pl-4 cursor-pointer"
              @click="onCellClick(col, row[col], $event)"
            >
              <span
                v-if="row[col] == null || row[col] === ''"
                class="font-[Inconsolata,monospace] text-[#929292] italic text-xs"
              >null</span>
              <span
                v-else-if="getColumnType(col) === 'boolean'"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px]"
                :class="isTruthy(row[col]) ? 'bg-[#B8FEC9] text-[#18753C]' : 'bg-[#FFE9E6] text-[#CE0500]'"
              >
                <span
                  class="size-2 rounded-full"
                  :class="isTruthy(row[col]) ? 'bg-[#18753C]' : 'bg-[#CE0500]'"
                />
                {{ isTruthy(row[col]) ? t('Vrai') : t('Faux') }}
              </span>
              <span
                v-else-if="getColumnType(col) === 'categorical'"
                class="inline-block rounded-[4px] font-medium px-2 py-0.5 text-xs max-w-full truncate"
                :style="getCategoryBadgeStyle(col, String(row[col]))"
              >{{ row[col] }}</span>
              <span
                v-else-if="getColumnType(col) === 'number'"
                class="font-mono tabular-nums text-xs text-[#161616]"
              >{{ formatNumber(row[col]) }}</span>
              <span
                v-else-if="getColumnType(col) === 'date'"
                class="font-mono tabular-nums text-xs text-[#161616]"
              >{{ formatDate(row[col]) }}</span>
              <span
                v-else
                class="text-[#161616] text-xs truncate block"
              >{{ row[col] }}</span>
            </div>
          </div>
          <button
            v-if="displayedColumns.length > 4"
            class="text-[11px] text-[#161616] hover:underline pt-1 flex items-center gap-1"
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

      <!-- Mobile: filter bottom sheet -->
      <TransitionRoot
        :show="mobileFilterOpen"
        as="template"
      >
        <Dialog
          class="relative z-[900]"
          @close="mobileFilterOpen = false"
        >
          <!-- Backdrop -->
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-black/30" />
          </TransitionChild>
          <!-- Panel -->
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="translate-y-full"
            enter-to="translate-y-0"
            leave="ease-in duration-200"
            leave-from="translate-y-0"
            leave-to="translate-y-full"
          >
            <div class="fixed inset-x-0 bottom-0 max-h-[80vh] flex flex-col bg-white rounded-t-2xl shadow-xl">
              <!-- Header -->
              <DialogPanel class="flex flex-col max-h-[80vh]">
                <div class="px-4 pt-4 pb-2 border-b border-[#E5E5E5]">
                  <DialogTitle class="text-sm font-bold">
                    {{ t('Filtres & tri par colonne') }}
                  </DialogTitle>
                  <p class="text-[11px] text-[#929292]">
                    {{ allColumns.length }} {{ t('colonnes') }} · {{ activeFilters.length }} {{ t('filtre') }}{{ activeFilters.length !== 1 ? 's' : '' }}
                  </p>
                </div>
                <!-- Column list -->
                <div class="flex-1 overflow-y-auto">
                  <div
                    v-for="col in allColumns"
                    :key="col"
                    class="border-b border-[#E5E5E5] last:border-b-0"
                  >
                    <button
                      class="flex items-center gap-2 w-full px-3 py-2.5 text-left"
                      :class="hasFilterForColumn(col) ? 'bg-blue-main/5' : ''"
                      @click="toggleMobileFilterColumn(col)"
                    >
                      <component
                        :is="columnTypeIcon(col)"
                        class="size-3.5 text-[#929292] shrink-0"
                        aria-hidden="true"
                      />
                      <span class="flex-1 text-[13px] text-[#161616] truncate">{{ col }}</span>
                      <RiArrowUpLine
                        v-if="sort?.column === col && sort.direction === 'asc'"
                        class="size-3 text-blue-main shrink-0"
                        aria-hidden="true"
                      />
                      <RiArrowDownLine
                        v-if="sort?.column === col && sort.direction === 'desc'"
                        class="size-3 text-blue-main shrink-0"
                        aria-hidden="true"
                      />
                      <span
                        v-if="hasFilterForColumn(col)"
                        class="size-2 rounded-full bg-blue-main shrink-0"
                      />
                      <RiArrowDownSLine
                        class="size-3.5 text-[#929292] shrink-0 transition-transform"
                        :class="{ 'rotate-180': mobileFilterExpandedCol === col }"
                        aria-hidden="true"
                      />
                    </button>
                    <div
                      v-if="mobileFilterExpandedCol === col"
                      class="pb-1"
                    >
                      <TabularFilterContent
                        v-model:sort="sort"
                        v-model:filters="filters"
                        :column="col"
                        :column-type="getColumnType(col)"
                        :column-profile="getColumnProfile(col)"
                        :null-percent="getNullPercent(col)"
                      />
                    </div>
                  </div>
                </div>
                <!-- Reset all -->
                <div
                  v-if="activeFilters.length > 0 || sort"
                  class="border-t border-[#E5E5E5] px-4 py-3"
                >
                  <button
                    class="w-full py-2 rounded bg-[#f6f6f6] text-xs text-[#3A3A3A] hover:bg-[#E5E5E5]"
                    @click="clearAllFilters(); sort = null; mobileFilterOpen = false"
                  >
                    {{ t('Tout réinitialiser') }}
                  </button>
                </div>
              </DialogPanel>
            </div>
          </TransitionChild>
        </Dialog>
      </TransitionRoot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch, useTemplateRef, type Component } from 'vue'
import { ofetch } from 'ofetch'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { Dialog, DialogPanel, DialogTitle, Popover, PopoverButton, PopoverPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  RiLayoutColumnLine,
  RiLayoutRowLine,
  RiArrowDownSLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiPriceTag3Line,
  RiText,
  RiCalendarLine,
  RiCheckboxLine,
  RiHashtag,
  RiFilter2Line,
  RiCloseLine,
} from '@remixicon/vue'
import { useFetch } from '../../functions/api'
import { useTranslation } from '../../composables/useTranslation'
import ClientOnly from '../ClientOnly.vue'
import SimpleBanner from '../SimpleBanner.vue'
import BrandedButton from '../BrandedButton.vue'
import InfiniteLoader from '../InfiniteLoader.vue'
import TabularCellPopover from './TabularCellPopover.vue'
import type { CellInfo } from './TabularCellPopover.vue'
import TabularFilterContent from './TabularFilterContent.vue'
import TabularFilterPopover from './TabularFilterPopover.vue'
import type { TabularDataResponse, TabularProfileResponse, TabularRow, ColumnType, SortConfig, ColumnFilters } from './types'

const props = defineProps<{
  resourceId: string
}>()

const { t } = useTranslation()

// Column selector popover positioning
const columnPopoverRef = useTemplateRef<InstanceType<typeof Popover>>('columnPopover')
const columnPanelRef = useTemplateRef<InstanceType<typeof PopoverPanel>>('columnPanel')

const { floatingStyles: columnFloatingStyles } = useFloating(columnPopoverRef, columnPanelRef, {
  placement: 'bottom-start',
  middleware: [flip(), shift()],
  whileElementsMounted: autoUpdate,
})

const dataUrl = computed(() =>
  `/tabular/resources/${props.resourceId}/data`,
)

const profileUrl = computed(() =>
  `/tabular/resources/${props.resourceId}/profile`,
)

// Sort & filter state
const sort = ref<SortConfig | null>(null)
const filters = ref<Record<string, ColumnFilters>>({})

const PAGE_SIZE = 50

const dataQuery = computed(() => {
  const q: Record<string, string | number> = { page: 1, page_size: PAGE_SIZE }
  if (sort.value) {
    q[`${sort.value.column}__sort`] = sort.value.direction
  }
  for (const [col, filter] of Object.entries(filters.value)) {
    if (filter.in?.length) {
      q[`${col}__in`] = filter.in.join(',')
    }
    if (typeof filter.min === 'number' && Number.isFinite(filter.min)) {
      q[`${col}__greater`] = filter.min
    }
    if (typeof filter.max === 'number' && Number.isFinite(filter.max)) {
      q[`${col}__less`] = filter.max
    }
    if (filter.contains) {
      q[`${col}__contains`] = filter.contains
    }
    if (filter.null === 'only') {
      q[`${col}__isnull`] = ''
    }
    else if (filter.null === 'exclude') {
      q[`${col}__isnotnull`] = ''
    }
  }
  return q
})

const { data: tableData, error } = await useFetch<TabularDataResponse>(dataUrl, { raw: true, query: dataQuery })

const { data: profileData } = await useFetch<TabularProfileResponse>(profileUrl, { raw: true })

// Infinite scroll state
const allRows = ref<TabularRow[]>([])
const currentPage = ref(1)
const hasMore = ref(false)
const loadingMore = ref(false)
const scrollContainerRef = useTemplateRef<HTMLElement>('scrollContainer')

watch(() => tableData.value, (data) => {
  if (data) {
    allRows.value = [...data.data]
    currentPage.value = 1
    hasMore.value = data.data.length < data.meta.total
  }
}, { immediate: true })

async function loadNextPage() {
  if (loadingMore.value || !hasMore.value || !tableData.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const query = { ...dataQuery.value, page: nextPage }
    const data = await ofetch<TabularDataResponse>(dataUrl.value, { params: query })
    allRows.value = [...allRows.value, ...data.data]
    currentPage.value = nextPage
    hasMore.value = allRows.value.length < tableData.value.meta.total
  }
  finally {
    loadingMore.value = false
  }
}

const totalLines = computed(() => profileData.value?.profile?.total_lines ?? tableData.value?.meta.total ?? 0)

const allColumns = computed(() => {
  if (!tableData.value?.data?.length) return []
  return Object.keys(tableData.value.data[0]).filter(key => key !== '__id')
})

const visibleColumns = ref(new Set(allColumns.value))

const displayedColumns = computed(() =>
  allColumns.value.filter(col => visibleColumns.value.has(col)),
)

const hiddenCount = computed(() =>
  allColumns.value.length - visibleColumns.value.size,
)

function toggleColumn(col: string) {
  const next = new Set(visibleColumns.value)
  if (next.has(col)) {
    if (next.size > 1) next.delete(col)
  }
  else {
    next.add(col)
  }
  visibleColumns.value = next
}

function showAllColumns() {
  visibleColumns.value = new Set(allColumns.value)
}

// Column resize
const columnWidths = ref<Record<string, number>>({})
const resizing = ref<{ column: string, startX: number, startWidth: number } | null>(null)

function initColumnWidths() {
  const ths = scrollContainerRef.value?.querySelectorAll('th')
  if (!ths) return
  const widths: Record<string, number> = {}
  ths.forEach((th, i) => {
    const col = displayedColumns.value[i]
    if (col) widths[col] = th.offsetWidth
  })
  columnWidths.value = widths
}

function startResize(col: string, e: MouseEvent) {
  if (!Object.keys(columnWidths.value).length) initColumnWidths()
  resizing.value = { column: col, startX: e.clientX, startWidth: columnWidths.value[col] ?? 100 }
  // Disable smooth scroll during resize
  if (scrollContainerRef.value) scrollContainerRef.value.style.scrollBehavior = 'auto'
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!resizing.value) return
  const container = scrollContainerRef.value
  // Auto-scroll when mouse approaches the right edge, and adjust startX to compensate
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
  resizing.value = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

// Cell popover
const activeCell = ref<CellInfo | null>(null)

function onCellClick(col: string, value: unknown, event: MouseEvent) {
  const td = (event.target as HTMLElement).closest('td') as HTMLElement | null
  if (!td) return
  if (activeCell.value && activeCell.value.element === td) {
    activeCell.value = null
    return
  }
  activeCell.value = { column: col, columnType: getColumnType(col), value, element: td }
}

// Active filters
interface ActiveFilter {
  column: string
  label: string
}

const activeFilters = computed<ActiveFilter[]>(() => {
  const result: ActiveFilter[] = []
  for (const [col, filter] of Object.entries(filters.value)) {
    const parts: string[] = []
    if (filter.in?.length) {
      parts.push(`= ${filter.in.join(', ')}`)
    }
    if (filter.contains) {
      parts.push(`${t('contient')} "${filter.contains}"`)
    }
    if (filter.null === 'only') {
      parts.push(t('null uniquement'))
    }
    else if (filter.null === 'exclude') {
      parts.push(t('sans null'))
    }
    if (filter.min != null && filter.max != null) {
      parts.push(`${filter.min} – ${filter.max}`)
    }
    else if (filter.min != null) {
      parts.push(`≥ ${filter.min}`)
    }
    else if (filter.max != null) {
      parts.push(`≤ ${filter.max}`)
    }
    if (parts.length) {
      result.push({ column: col, label: parts.join(', ') })
    }
  }
  return result
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

function removeFilter(column: string) {
  const { [column]: _, ...rest } = filters.value
  filters.value = rest
}

function clearAllFilters() {
  filters.value = {}
}

function hasFilterForColumn(col: string): boolean {
  const f = filters.value[col]
  if (!f) return false
  return !!(f.in?.length || f.contains || f.null || f.min != null || f.max != null)
}

// Mobile state
const mobileFilterOpen = ref(false)
const mobileExpandedRows = ref(new Set<number>())
const mobileFilterExpandedCol = ref<string | null>(null)

function mobileVisibleFields(row: TabularRow, index: number): string[] {
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

function toggleMobileFilterColumn(col: string) {
  mobileFilterExpandedCol.value = mobileFilterExpandedCol.value === col ? null : col
}

// Column type helpers
function getColumnType(col: string): ColumnType {
  const profile = profileData.value?.profile
  if (!profile) return 'text'
  const colInfo = profile.columns[col]
  if (!colInfo) return 'text'
  if (['int', 'float'].includes(colInfo.python_type)) return 'number'
  if (colInfo.format === 'year') return 'date'
  if (['date', 'datetime'].includes(colInfo.python_type)) return 'date'
  if (colInfo.python_type === 'bool') return 'boolean'
  if (profile.categorical.includes(col)) return 'categorical'
  return 'text'
}

function getColumnProfile(col: string) {
  return profileData.value?.profile?.profile?.[col] ?? null
}

function getTopsEntries(col: string) {
  return getColumnProfile(col)?.tops ?? []
}

function getNullPercent(col: string) {
  const colProfile = getColumnProfile(col)
  const total = profileData.value?.profile?.total_lines
  if (!colProfile || !total) return '0%'
  return `${((colProfile.nb_missing_values / total) * 100).toFixed(1)}%`
}

const typeConfig: Record<ColumnType, { icon: Component, label: string }> = {
  number: { icon: RiHashtag, label: t('Nombre') },
  categorical: { icon: RiPriceTag3Line, label: t('Catégoriel') },
  text: { icon: RiText, label: t('Texte') },
  date: { icon: RiCalendarLine, label: t('Date') },
  boolean: { icon: RiCheckboxLine, label: t('Booléen') },
}

function columnTypeIcon(col: string): Component {
  return typeConfig[getColumnType(col)].icon
}

function columnTypeLabel(col: string): string {
  return typeConfig[getColumnType(col)].label
}

// Cell rendering helpers
function formatNumber(value: unknown): string {
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return num.toLocaleString('fr-FR')
}

function formatDate(value: unknown): string {
  if (value == null || value === '') return '–'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}

const BADGE_PALETTE = [
  { bg: '#E6EEFE', text: '#3558A2' }, // blue-cumulus
  { bg: '#E8E3DB', text: '#6A6156' }, // beige-gris-galet
  { bg: '#FEECC2', text: '#695240' }, // yellow-tournesol
  { bg: '#C7F6FC', text: '#006A6F' }, // green-archipel
  { bg: '#E9EDFE', text: '#2323FF' }, // blue-ecume
  { bg: '#FFE0C7', text: '#885B40' }, // orange-terre-battue
  { bg: '#F2E9DB', text: '#6B4C35' }, // brown-cafe-creme
  { bg: '#BAFAEE', text: '#297254' }, // green-menthe
  { bg: '#FEE0EB', text: '#8D5368' }, // pink-macaron
  { bg: '#FCE164', text: '#695240' }, // yellow-moutarde
] as const

const BADGE_FALLBACK = { bg: '#F0E0CF', text: '#745B47' } // brown-opera

const badgeColorMap = computed(() => {
  const map = new Map<string, { bg: string, text: string }>()
  const profile = profileData.value?.profile
  if (!profile) return map
  for (const col of profile.categorical) {
    getTopsEntries(col).forEach((top, i) => {
      map.set(`${col}::${top.value}`, BADGE_PALETTE[i % BADGE_PALETTE.length])
    })
  }
  return map
})

function getCategoryBadgeStyle(col: string, value: string): { backgroundColor: string, color: string } {
  const colors = badgeColorMap.value.get(`${col}::${value}`) ?? BADGE_FALLBACK
  return { backgroundColor: colors.bg, color: colors.text }
}
</script>
