<template>
  <div>
    <div
      v-if="previewError"
      class="max-w-3xl mx-auto"
    >
      <SimpleBanner
        type="warning"
        class="mb-4"
      >
        {{ t("L'aperçu de ce fichier n'a pas pu être chargé.") }}
        <pre class="text-xs mt-2 whitespace-pre-wrap break-words">{{ previewError }}</pre>
      </SimpleBanner>
    </div>

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

    <template v-else-if="tableData && profileData">
      <!-- Toolbar & active filters inherit the host's 1rem horizontal padding
           (px-4 on ResourceExplorerViewer's TabPanel, .container on
           ExploreResourceView), so they line up with the resource title /
           download button above. Only the table itself goes edge-to-edge
           (via -mx-4 below). -->
      <div>
        <div class="flex items-center gap-2 py-3">
          <!-- Left: active filter/sort chips + clear all -->
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <!-- Mobile: filter & sort button -->
            <BrandedButton
              class="md:hidden"
              color="tertiary"
              size="2xs"
              :icon="RiFilterLine"
              keep-margins-even-without-borders
              @click="mobileFilterOpen = true"
            >
              {{ t('Filtres & tri') }}
            </BrandedButton>

            <div class="hidden md:block">
              <TabularActiveFilters with-clear />
            </div>
          </div>

          <!-- Right: columns + rows (both inject the shared context) -->
          <div class="flex shrink-0 items-center gap-4">
            <TabularColumnsMenu />
            <TabularRowsInfo />
          </div>
        </div>
      </div>
      <!-- /toolbar & active filters -->

      <TabularTable />

      <TabularMobileFilters />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ofetch } from 'ofetch'
import { RiFilterLine } from '@remixicon/vue'
import { useFetch } from '../../functions/api'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import { injectTabularProfile } from '../../composables/useTabularProfile'
import { buildTypeConfig, buildFormatConfig, humanizeFormat, GENERIC_FORMATS, hasFilterForColumn as _hasFilterForColumn, isTruthy, isFalsy, resolveColumnType } from '../../functions/tabular'
import SimpleBanner from '../SimpleBanner.vue'
import BrandedButton from '../BrandedButton.vue'
import TabularActiveFilters from './TabularActiveFilters.vue'
import TabularColumnsMenu from './TabularColumnsMenu.vue'
import TabularRowsInfo from './TabularRowsInfo.vue'
import TabularTable from './TabularTable.vue'
import TabularMobileFilters from './TabularMobileFilters.vue'
import type { TabularDataResponse, TabularRow, ColumnType, SortConfig, ColumnFilters, BadgeStyle } from './types'
import { provideTabularContext, type ActiveFilter } from './useTabularContext'

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

// Column type helpers
function getColumnTypeFromName(col: string): ColumnType {
  const profile = profileData.value?.profile
  if (!profile) return 'text'
  const colInfo = profile.columns[col]
  if (!colInfo) return 'text'
  return resolveColumnType(colInfo, profile.categorical.includes(col))
}

const columnTypesMap = computed(() => {
  const map: Record<string, ColumnType> = {}
  for (const col of allColumns.value) {
    map[col] = getColumnTypeFromName(col)
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
const formatConfig = buildFormatConfig(t)

function getTypeConfig(col: string) {
  return typeConfig[getColumnType(col)]
}

// Header display: prefer the rich semantic format detected by csv-detective
// (code INSEE, UAI, département, SIREN, email…) over the generic display type.
// Tolerant: generic formats fall back to the type config, and unknown semantic
// formats are humanized rather than dropped.
function getColumnDisplay(col: string) {
  const format = profileData.value?.profile?.columns?.[col]?.format
  const fallback = getTypeConfig(col)
  if (!format || GENERIC_FORMATS.has(format)) return fallback
  return formatConfig[format] ?? { icon: fallback.icon, label: humanizeFormat(format) }
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
  getCategoryBadgeStyle,
  getCategoryBadgeStylesForColumn,
  getBooleanCounts,
})
</script>
