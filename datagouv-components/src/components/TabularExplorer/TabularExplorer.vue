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

    <template v-else-if="tableData">
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
          <!-- Columns (clickable, opens column popover) -->
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
                  <div class="flex items-center justify-between px-3 py-2 border-b border-gray-default">
                    <span class="text-xs font-medium text-gray-title">
                      {{ visibleColumns.size }} {{ t('sur') }} {{ allColumns.length }} {{ t('colonnes visibles') }}
                    </span>
                    <BrandedButton
                      v-if="hiddenCount"
                      color="tertiary"
                      size="2xs"
                      @click="showAllColumns"
                    >
                      {{ t('Tout afficher') }}
                    </BrandedButton>
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
                        class="size-3.5 accent-new-primary"
                        @change="toggleColumn(col)"
                      >
                      <span class="truncate">{{ col }}</span>
                    </label>
                  </div>
                </PopoverPanel>
              </Teleport>
            </ClientOnly>
          </Popover>

          <!-- Rows -->
          <span class="flex items-center gap-1.5 text-xs text-gray-plain">
            <RiLayoutRowLine
              class="size-3 text-mention-grey"
              aria-hidden="true"
            />
            <span class="font-bold hidden md:inline">{{ t('Lignes') }}</span>
            <span class="font-mono tabular-nums">{{ tableData.meta.total.toLocaleString() }}/{{ totalLines.toLocaleString() }}</span>
          </span>
        </div>
      </div>

      <!-- Active filters -->
      <div
        v-if="activeFilters.length > 0"
        class="bg-gray-some border border-gray-default rounded-xl px-3 py-2.5 mb-3 space-y-2.5"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <RiFilter2Line
              class="size-3.5"
              aria-hidden="true"
            />
            <span class="text-xs text-gray-plain">{{ t('Filtres actifs') }}</span>
            <span class="inline-flex items-center justify-center rounded-full bg-new-primary/10 text-new-primary text-xs tabular-nums min-w-5 h-5 px-1.5">
              {{ activeFilters.length }}
            </span>
          </div>
          <BrandedButton
            color="tertiary"
            size="2xs"
            :icon="RiCloseLine"
            @click="clearAllFilters"
          >
            {{ t('Tout effacer') }}
          </BrandedButton>
        </div>
        <!-- Chips -->
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="af in activeFilters"
            :key="af.column"
            class="inline-flex items-center gap-1.5 bg-white border border-gray-silver rounded-lg pl-2 pr-1 py-1 text-xs"
          >
            <component
              :is="getTypeConfig(af.column).icon"
              class="size-3 text-gray-title"
              aria-hidden="true"
            />
            <span class="text-gray-title">{{ af.column }}</span>
            <span class="text-gray-plain">{{ af.label }}</span>
            <button
              class="rounded p-0.5 text-gray-low hover:text-gray-plain hover:bg-gray-100"
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
            <tr class="border-b border-gray-default">
              <th
                v-for="col in displayedColumns"
                :key="col"
                class="group/th relative h-14 px-2 text-left align-middle whitespace-nowrap border-r border-gray-default last:border-r-0"
                :style="columnWidths[col] ? { width: columnWidths[col] + 'px', minWidth: columnWidths[col] + 'px', maxWidth: columnWidths[col] + 'px' } : undefined"
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
                <!-- Column type -->
                <span class="font-mono text-xs text-gray-plain -mt-0.5 inline-flex items-center gap-1">
                  <component
                    :is="getTypeConfig(col).icon"
                    class="size-3"
                    aria-hidden="true"
                  />
                  <span class="mt-px">{{ getTypeConfig(col).label }}</span>
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
                :style="columnWidths[col] ? { maxWidth: columnWidths[col] + 'px' } : undefined"
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
      <div class="md:hidden space-y-2 px-1">
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
            v-for="col in mobileVisibleFields(row, i)"
            :key="col"
            class="flex flex-col gap-0.5 min-w-0"
          >
            <div class="flex items-center gap-1 min-w-0">
              <component
                :is="getTypeConfig(col).icon"
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
                <div class="px-4 pt-4 pb-2 border-b border-gray-default">
                  <DialogTitle class="text-sm font-bold">
                    {{ t('Filtres & tri par colonne') }}
                  </DialogTitle>
                  <p class="text-xs text-gray-low">
                    {{ allColumns.length }} {{ t('colonnes') }} · {{ activeFilters.length }} {{ t('filtre') }}{{ activeFilters.length !== 1 ? 's' : '' }}
                  </p>
                </div>
                <!-- Column list -->
                <div class="flex-1 overflow-y-auto">
                  <div
                    v-for="col in allColumns"
                    :key="col"
                    class="border-b border-gray-default last:border-b-0"
                  >
                    <button
                      class="flex items-center gap-2 w-full px-3 py-2.5 text-left"
                      :class="hasFilterForColumn(col) ? 'bg-new-primary/5' : ''"
                      @click="toggleMobileFilterColumn(col)"
                    >
                      <component
                        :is="getTypeConfig(col).icon"
                        class="size-3.5 text-gray-low shrink-0"
                        aria-hidden="true"
                      />
                      <span class="flex-1 text-sm text-gray-title truncate">{{ col }}</span>
                      <RiArrowUpLine
                        v-if="sort?.column === col && sort.direction === 'asc'"
                        class="size-3 text-new-primary shrink-0"
                        aria-hidden="true"
                      />
                      <RiArrowDownLine
                        v-if="sort?.column === col && sort.direction === 'desc'"
                        class="size-3 text-new-primary shrink-0"
                        aria-hidden="true"
                      />
                      <span
                        v-if="hasFilterForColumn(col)"
                        class="size-2 rounded-full bg-new-primary shrink-0"
                      />
                      <RiArrowDownSLine
                        class="size-3.5 text-gray-low shrink-0 transition-transform"
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
                        :total-lines="totalLines"
                        :category-badge-styles="getColumnType(col) === 'categorical' ? getCategoryBadgeStylesForColumn(col) : undefined"
                        :boolean-counts="getColumnType(col) === 'boolean' ? getBooleanCounts(col) : undefined"
                      />
                    </div>
                  </div>
                </div>
                <!-- Reset all -->
                <div
                  v-if="activeFilters.length > 0 || sort"
                  class="border-t border-gray-default px-4 py-3"
                >
                  <BrandedButton
                    color="secondary"
                    size="xs"
                    class="w-full"
                    @click="clearAllFilters(); sort = null; mobileFilterOpen = false"
                  >
                    {{ t('Tout réinitialiser') }}
                  </BrandedButton>
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
import { computed, onUnmounted, ref, watch, useTemplateRef } from 'vue'
import { ofetch } from 'ofetch'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { Dialog, DialogPanel, DialogTitle, Popover, PopoverButton, PopoverPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  RiLayoutColumnLine,
  RiLayoutRowLine,
  RiArrowDownSLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFilter2Line,
  RiCloseLine,
  RiSearchLine,
} from '@remixicon/vue'
import { useFetch } from '../../functions/api'
import { useTranslation } from '../../composables/useTranslation'
import { buildTypeConfig, hasFilterForColumn as _hasFilterForColumn, isTruthy, isFalsy } from '../../functions/tabular'
import ClientOnly from '../ClientOnly.vue'
import SimpleBanner from '../SimpleBanner.vue'
import BrandedButton from '../BrandedButton.vue'
import InfiniteLoader from '../InfiniteLoader.vue'
import TabularCell from './TabularCell.vue'
import TabularCellPopover from './TabularCellPopover.vue'
import type { CellInfo } from './TabularCellPopover.vue'
import TabularFilterContent from './TabularFilterContent.vue'
import TabularFilterPopover from './TabularFilterPopover.vue'
import type { TabularDataResponse, TabularProfileResponse, TabularRow, ColumnType, SortConfig, ColumnFilters, BadgeStyle } from './types'

const props = defineProps<{
  resourceId: string
}>()

const { t } = useTranslation()

// Column selector popover positioning
const columnAnchorComponent = useTemplateRef<InstanceType<typeof Popover>>('columnAnchor')
const columnPanelComponent = useTemplateRef<InstanceType<typeof PopoverPanel>>('columnPanel')
const columnAnchorEl = computed(() => columnAnchorComponent.value?.$el as HTMLElement | undefined)
const columnPanelEl = computed(() => columnPanelComponent.value?.$el as HTMLElement | undefined)

const { floatingStyles: columnFloatingStyles } = useFloating(columnAnchorEl, columnPanelEl, {
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
    if (filter.exact != null) {
      q[`${col}__exact`] = filter.exact
    }
    if (Number.isFinite(filter.min)) {
      q[`${col}__greater`] = filter.min!
    }
    if (Number.isFinite(filter.max)) {
      q[`${col}__less`] = filter.max!
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
const generation = ref(0)
const scrollContainerRef = useTemplateRef<HTMLElement>('scrollContainer')

watch(() => tableData.value, (data) => {
  generation.value++
  if (data) {
    allRows.value = [...data.data]
    currentPage.value = 1
    hasMore.value = data.data.length < data.meta.total
  }
}, { immediate: true })

async function loadNextPage() {
  if (loadingMore.value || !hasMore.value || !tableData.value) return
  loadingMore.value = true
  const gen = generation.value
  try {
    const nextPage = currentPage.value + 1
    const query = { ...dataQuery.value, page: nextPage }
    const data = await ofetch<TabularDataResponse>(dataUrl.value, { params: query })
    // Discard stale response if filters/sort changed during the fetch
    if (gen !== generation.value) return
    allRows.value = [...allRows.value, ...data.data]
    currentPage.value = nextPage
    hasMore.value = allRows.value.length < tableData.value.meta.total
  }
  finally {
    loadingMore.value = false
  }
}

const totalLines = computed(() => profileData.value?.profile?.total_lines ?? tableData.value?.meta.total ?? 0)

const allColumns = computed(() => profileData.value?.profile?.header ?? [])

const visibleColumns = ref(new Set(allColumns.value))

watch(allColumns, (cols) => {
  if (cols.length > 0 && visibleColumns.value.size === 0) {
    visibleColumns.value = new Set(cols)
  }
})

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
  const el = (event.target as HTMLElement).closest('[data-cell]') as HTMLElement | null
  if (!el) return
  if (activeCell.value && activeCell.value.element === el) {
    activeCell.value = null
    return
  }
  activeCell.value = { column: col, columnType: columnTypesMap.value[col] ?? 'text', value, element: el }
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
    if (filter.exact != null) {
      parts.push(`= ${filter.exact === 'true' ? t('Vrai') : t('Faux')}`)
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

function removeFilter(column: string) {
  const { [column]: _, ...rest } = filters.value
  filters.value = rest
}

function clearAllFilters() {
  filters.value = {}
}

function hasFilterForColumn(col: string): boolean {
  return _hasFilterForColumn(filters.value, col)
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
function resolveColumnType(col: string): ColumnType {
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

const columnTypesMap = computed(() => {
  const map: Record<string, ColumnType> = {}
  for (const col of allColumns.value) {
    map[col] = resolveColumnType(col)
  }
  return map
})

function getColumnType(col: string): ColumnType {
  return columnTypesMap.value[col] ?? 'text'
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

const typeConfig = buildTypeConfig(t)

function getTypeConfig(col: string) {
  return typeConfig[getColumnType(col)]
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
      map.set(`${col}::${top.value}`, BADGE_PALETTE[i % BADGE_PALETTE.length]!)
    })
  }
  return map
})

function getCategoryBadgeStyle(col: string, value: string): BadgeStyle {
  const colors = badgeColorMap.value.get(`${col}::${value}`) ?? BADGE_FALLBACK
  return { backgroundColor: colors.bg, color: colors.text }
}

function getCategoryBadgeStylesForColumn(col: string): Record<string, BadgeStyle> {
  const styles: Record<string, BadgeStyle> = {}
  for (const top of getTopsEntries(col)) {
    styles[top.value] = getCategoryBadgeStyle(col, top.value)
  }
  return styles
}

function getBooleanCounts(col: string): { trueCount: number, falseCount: number } {
  const profile = getColumnProfile(col)
  if (!profile?.tops) return { trueCount: 0, falseCount: 0 }
  let trueCount = 0
  let falseCount = 0
  for (const top of profile.tops) {
    if (isTruthy(top.value ?? '')) trueCount += top.count
    else if (isFalsy(top.value ?? '')) falseCount += top.count
  }
  return { trueCount, falseCount }
}
</script>
