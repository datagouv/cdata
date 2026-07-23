<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <PreviewUnavailable v-if="previewError">
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé.") }}
      <br>
      <span class="text-xs break-words">{{ previewError }}</span>
    </PreviewUnavailable>

    <div
      v-else-if="previewLoading"
      class="animate-pulse-placeholder"
      :aria-label="t('Chargement de l\'aperçu…')"
      role="status"
    >
      <div>
        <div class="flex items-center justify-end gap-4 py-3">
          <div class="h-4 w-20 bg-gray-200" />
          <div class="h-4 w-20 bg-gray-200" />
        </div>
      </div>
      <div class="overflow-hidden">
        <table class="w-full text-sm border-collapse">
          <thead class="shadow-[inset_0_-1px_0_0_#E5E5E5]">
            <tr>
              <th
                v-for="i in 6"
                :key="i"
                class="px-3 py-2 text-left"
              >
                <div class="h-4 w-24 bg-gray-200" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in 8"
              :key="row"
              class="border-b border-gray-100"
            >
              <td
                v-for="col in 6"
                :key="col"
                class="px-3 py-2.5"
              >
                <div class="h-3 bg-gray-200" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loaded: the consumer composes the parts (toolbar, table, mobile sheet) from
         the provided context, so it controls the framing and layout. -->
    <template v-else-if="tableData && profileData">
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ofetch } from 'ofetch'
import { useFetch } from '../../functions/api'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import { injectTabularProfile } from '../../composables/useTabularProfile'
import { hasFilterForColumn as _hasFilterForColumn } from '../../functions/tabular'
import PreviewUnavailable from '../ResourceAccordion/PreviewUnavailable.vue'
import type { TabularDataResponse, TabularRow, SortConfig, ColumnFilters } from './types'
import { provideTabularContext, type ActiveFilter } from './useTabularContext'
import { useColumnMetadata } from './useColumnMetadata'

const props = defineProps<{
  resourceId: string
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

const dataUrl = computed(() =>
  `${config.tabularApiUrl}/api/resources/${props.resourceId}/data/`,
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

// Profile is shared with sibling components (e.g. DataStructure) via
// `provideTabularProfile` in the parent. Falls back to a local fetch
// when no parent provides it (standalone usage).
const { data: profileData, error: profileError, status: profileStatus } = await injectTabularProfile(() => props.resourceId)

// The component renders nothing useful until the profile is available
// (allColumns is derived from it). Surface a clear loading / error state
// so we don't end up with an empty table + a spinner running forever.
const profileLoading = computed(() => !profileData.value && (profileStatus.value === 'idle' || profileStatus.value === 'pending'))
const previewError = computed(() => error.value || profileError.value)
const previewLoading = computed(() => !previewError.value && (!tableData.value || profileLoading.value))

// Infinite scroll state
const allRows = ref<TabularRow[]>([])
const currentPage = ref(1)
const hasMore = ref(false)
const loadingMore = ref(false)
const generation = ref(0)

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
    next.delete(col)
  }
  else {
    next.add(col)
  }
  visibleColumns.value = next
}

function showAllColumns() {
  visibleColumns.value = new Set(allColumns.value)
}

function hideAllColumns() {
  visibleColumns.value = new Set()
}

function selectOnlyColumn(col: string) {
  visibleColumns.value = new Set([col])
}

// Active filters
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

// Whether the mobile filter sheet is open (button lives in the toolbar).
const mobileFilterOpen = ref(false)

// Column metadata (display type, label/icon, null ratio, badge colors, boolean
// counts) — pure derivations of the profile, extracted to keep this component
// focused on data fetching, pagination and filter/column state.
const {
  columnTypesMap,
  getColumnType,
  getColumnProfile,
  getColumnDisplay,
  getTopsEntries,
  getNullPercent,
  getBooleanCounts,
} = useColumnMetadata(profileData, allColumns, t)

// Provide the shared state so child components (active filters, columns menu, rows
// info, table…) can inject it instead of receiving a wall of props.
provideTabularContext({
  resourceId: computed(() => props.resourceId),
  tableData,
  totalLines,
  allRows,
  hasMore,
  loadingMore,
  loadNextPage,
  sort,
  filters,
  activeFilters,
  removeFilter,
  clearAllFilters,
  hasFilterForColumn,
  allColumns,
  visibleColumns,
  displayedColumns,
  hiddenCount,
  toggleColumn,
  showAllColumns,
  hideAllColumns,
  selectOnlyColumn,
  mobileFilterOpen,
  columnTypesMap,
  getColumnType,
  getColumnProfile,
  getColumnDisplay,
  getTopsEntries,
  getNullPercent,
  getBooleanCounts,
})
</script>
