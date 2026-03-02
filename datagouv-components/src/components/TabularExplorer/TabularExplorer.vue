<template>
  <div class="tabular-explorer">
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
      <div class="flex items-center py-3">
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
              <span class="font-bold">{{ t('Colonnes') }}</span>
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
            <span class="font-bold">{{ t('Lignes') }}</span>
            <span class="font-mono tabular-nums">{{ allRows.length.toLocaleString() }}/{{ tableData.meta.total.toLocaleString() }}</span>
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
        <table class="w-full text-sm border-collapse table-fixed">
          <thead class="sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_0_#E5E5E5]">
            <tr class="border-b border-[#E5E5E5]">
              <th
                v-for="col in displayedColumns"
                :key="col"
                class="h-14 px-2 text-left align-middle whitespace-nowrap border-r border-[#E5E5E5] last:border-r-0"
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
                    class="mt-1.5"
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
                class="p-2 align-middle whitespace-nowrap border-r border-[#E5E5E5] last:border-r-0 overflow-hidden cursor-pointer"
                :class="{ 'text-right font-mono tabular-nums text-sm': getColumnType(col) === 'number' || getColumnType(col) === 'date' }"
                @click="onCellClick(col, row[col], $event)"
              >
                <span
                  v-if="row[col] == null || row[col] === ''"
                  class="text-gray-medium italic text-sm"
                >–</span>
                <span v-else-if="getColumnType(col) === 'number'">{{ formatNumber(row[col]) }}</span>
                <span v-else-if="getColumnType(col) === 'date'">{{ row[col] }}</span>
                <span
                  v-else-if="getColumnType(col) === 'categorical'"
                  class="inline-flex items-center rounded-[4px] font-medium px-2 py-0.5 text-xs"
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
      <div class="md:hidden space-y-3">
        <div
          v-for="(row, i) in allRows"
          :key="row.__id ?? i"
          class="border border-gray-default rounded p-3 space-y-1"
        >
          <div
            v-for="col in displayedColumns"
            :key="col"
            class="flex justify-between gap-2 text-xs"
          >
            <span class="font-medium text-gray-title shrink-0">{{ col }}</span>
            <span
              v-if="row[col] == null || row[col] === ''"
              class="text-gray-medium italic text-right"
            >–</span>
            <span
              v-else
              class="text-right truncate"
            >{{ row[col] }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Debug: Profile -->
    <details class="mt-8 border border-gray-default rounded p-4">
      <summary class="cursor-pointer font-medium text-sm mb-2">
        Debug: Profile API response
      </summary>
      <pre
        v-if="profileData"
        class="text-xs overflow-auto max-h-[600px] bg-gray-50 p-3 rounded"
      >{{ JSON.stringify(profileData, null, 2) }}</pre>
      <div
        v-else
        class="text-sm text-gray-medium"
      >
        {{ profileError ? 'Erreur lors du chargement du profil.' : 'Chargement…' }}
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef, type Component } from 'vue'
import { ofetch } from 'ofetch'
import { flip, shift, autoUpdate, useFloating } from '@floating-ui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
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
import InfiniteLoader from '../InfiniteLoader.vue'
import TabularCellPopover from './TabularCellPopover.vue'
import type { CellInfo } from './TabularCellPopover.vue'
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
  }
  return q
})

const { data: tableData, error } = await useFetch<TabularDataResponse>(dataUrl, { raw: true, query: dataQuery })

const { data: profileData, error: profileError } = await useFetch<TabularProfileResponse>(profileUrl, { raw: true })

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

// Cell popover
const activeCell = ref<CellInfo | null>(null)

function onCellClick(col: string, value: unknown, event: MouseEvent) {
  const td = (event.target as HTMLElement).closest('td') as HTMLElement | null
  if (!td) return
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
  number: { icon: RiHashtag, label: 'Nombre' },
  categorical: { icon: RiPriceTag3Line, label: 'Catégoriel' },
  text: { icon: RiText, label: 'Texte' },
  date: { icon: RiCalendarLine, label: 'Date' },
  boolean: { icon: RiCheckboxLine, label: 'Booléen' },
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

const BADGE_PALETTE = [
  // Sobres mais colorées (valeurs fréquentes)
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#E8E3DB', text: '#6A6156' },
  { bg: '#E0E7FF', text: '#3730A3' },
  // Flash (valeurs moyennement fréquentes)
  { bg: '#FCE164', text: '#695240' },
  { bg: '#FEE7FC', text: '#6E445A' },
  { bg: '#BAFAEE', text: '#297254' },
  { bg: '#FECACA', text: '#991B1B' },
  // Fades (valeurs rares)
  { bg: '#F0F0F0', text: '#666666' },
  { bg: '#E8E8E8', text: '#737373' },
  { bg: '#F5F5F5', text: '#8B8B8B' },
  { bg: '#EBEBEB', text: '#7A7A7A' },
] as const

const BADGE_FALLBACK = { bg: '#F5F5F5', text: '#666666' }

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
