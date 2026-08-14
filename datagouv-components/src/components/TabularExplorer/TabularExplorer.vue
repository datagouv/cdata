<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <PreviewUnavailable v-if="previewError">
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé.") }}
      <br>
      <span class="text-xs break-words">{{ previewError }}</span>
    </PreviewUnavailable>

    <!-- Same skeleton as the Suspense fallback above us: in both cases the slot isn't
         rendered yet, so its toolbar is a placeholder too. -->
    <TabularSkeleton v-else-if="previewLoading" />

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
import { hasFilterForColumn as _hasFilterForColumn, buildGlobalSearchConditions } from '../../functions/tabular'
import PreviewUnavailable from '../ResourceAccordion/PreviewUnavailable.vue'
import TabularSkeleton from './TabularSkeleton.vue'
import type { TabularDataResponse, TabularRow, SortConfig, ColumnFilters } from './types'
import { provideTabularContext, type ActiveFilter } from './useTabularContext'
import { useColumnMetadata } from './useColumnMetadata'

const props = defineProps<{
  resourceId: string
  // When set, searches across multiple columns using the Tabular API's or(...)
  // parameter. Text and categorical columns get a __contains filter; number
  // columns get a __exact filter (since __contains is not supported for numbers
  // by the API). Year, date and boolean columns are excluded.
  // Note: combined via AND with any existing column-specific `contains` filters,
  // so it acts as an additional narrowing constraint, not a replacement.
  globalSearch?: string
  // Filters seeded on mount, e.g. { 'Administration': { contains: 'Ministère' } }.
  // The explorer owns them afterwards: later changes to this prop are ignored,
  // so pass a fresh instance (or remount) to reset them.
  initialFilters?: Record<string, ColumnFilters>
  // Sort seeded on mount, e.g. { column: 'Séance', direction: 'desc' }.
  // Same ownership rule as `initialFilters`: the explorer owns it afterwards,
  // and the user can drop it from the active-sort chip.
  initialSort?: SortConfig
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

const dataUrl = computed(() =>
  `${config.tabularApiUrl}/api/resources/${props.resourceId}/data/`,
)

// Profile is shared with sibling components (e.g. DataStructure) via
// `provideTabularProfile` in the parent. Falls back to a local fetch
// when no parent provides it (standalone usage).
// Fetched before the rows: `dataQuery` reads the column types to build the
// global search, so the profile has to be resolved by the time it is evaluated.
const { data: profileData, error: profileError, status: profileStatus } = await injectTabularProfile(() => props.resourceId)

const allColumns = computed(() => profileData.value?.profile?.header ?? [])

// Column metadata (display type, label/icon, null ratio, boolean counts) — pure
// derivations of the profile, extracted to keep this component focused on data
// fetching, pagination and filter/column state.
const {
  columnTypesMap,
  getColumnType,
  getColumnProfile,
  getColumnDisplay,
  getNullPercent,
  getBooleanCounts,
} = useColumnMetadata(profileData, allColumns, t)

// Sort & filter state
const sort = ref<SortConfig | null>(props.initialSort ? { ...props.initialSort } : null)
const filters = ref<Record<string, ColumnFilters>>({ ...props.initialFilters })

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
  if (props.globalSearch && profileData.value?.profile) {
    const conditions = buildGlobalSearchConditions(allColumns.value, getColumnType, props.globalSearch)
    q.or = '(' + conditions.join(',') + ')'
  }
  return q
})

const { data: tableData, error, status: dataStatus } = await useFetch<TabularDataResponse>(dataUrl, { raw: true, query: dataQuery })

// The component renders nothing useful until the profile is available
// (allColumns is derived from it). Surface a clear loading / error state
// so we don't end up with an empty table + a spinner running forever.
const profileLoading = computed(() => !profileData.value && (profileStatus.value === 'idle' || profileStatus.value === 'pending'))
const previewError = computed(() => error.value || profileError.value)
const previewLoading = computed(() => !previewError.value && (!tableData.value || profileLoading.value))
// A search / filter / sort change refetches while the previous rows stay on
// screen: without a signal, the table looks unchanged for several seconds.
const isRefreshing = computed(() => dataStatus.value === 'pending' && !previewLoading.value)

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
      if (getColumnType(col) === 'boolean') {
        parts.push(`= ${filter.exact === 'true' ? t('Vrai') : t('Faux')}`)
      }
      else {
        parts.push(`= ${filter.exact}`)
      }
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

// Provide the shared state so child components (active filters, columns menu, rows
// info, table…) can inject it instead of receiving a wall of props.
provideTabularContext({
  tableData,
  totalLines,
  allRows,
  hasMore,
  loadNextPage,
  isRefreshing,
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
  getNullPercent,
  getBooleanCounts,
})
</script>
