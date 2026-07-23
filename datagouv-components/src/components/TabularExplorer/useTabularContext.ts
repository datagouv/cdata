import type { Component, ComputedRef, InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'
import type {
  ColumnFilters,
  ColumnType,
  SortConfig,
  TabularColumnProfile,
  TabularDataResponse,
  TabularRow,
  TabularTopValue,
} from './types'

export type ActiveFilter = {
  column: string
  label: string
}

export type ColumnDisplay = {
  icon: Component
  label: string
}

// Data + cross-cutting state shared by the tabular explorer's parts (toolbar, header
// filters, table). Provided by <TabularExplorer>, injected by children so they can be
// arranged freely without prop-drilling.
//
// NOT here — kept local to whoever renders it, because nothing else needs it:
//   - column widths / resize, cell popover, mobile row expansion → TabularTable
//   - mobile filter sheet's expanded column → TabularMobileFilters
export type TabularContext = {
  resourceId: ComputedRef<string>

  // Data & pagination (the parent owns the fetch, children just render it)
  tableData: Ref<TabularDataResponse | null>
  totalLines: ComputedRef<number>
  allRows: Ref<TabularRow[]>
  hasMore: Ref<boolean>
  loadingMore: Ref<boolean>
  loadNextPage: () => Promise<void>

  // Sort & filters
  sort: Ref<SortConfig | null>
  filters: Ref<Record<string, ColumnFilters>>
  activeFilters: ComputedRef<ActiveFilter[]>
  removeFilter: (column: string) => void
  clearAllFilters: () => void
  hasFilterForColumn: (col: string) => boolean

  // Columns visibility
  allColumns: ComputedRef<string[]>
  visibleColumns: Ref<Set<string>>
  displayedColumns: ComputedRef<string[]>
  hiddenCount: ComputedRef<number>
  toggleColumn: (col: string) => void
  showAllColumns: () => void
  hideAllColumns: () => void
  selectOnlyColumn: (col: string) => void

  // Mobile filter sheet open/close (button lives in the toolbar, sheet elsewhere)
  mobileFilterOpen: Ref<boolean>

  // Column metadata helpers (pure derivations of the profile)
  columnTypesMap: ComputedRef<Record<string, ColumnType>>
  getColumnType: (col: string) => ColumnType
  getColumnProfile: (col: string) => TabularColumnProfile | null
  getColumnDisplay: (col: string) => ColumnDisplay
  getTopsEntries: (col: string) => TabularTopValue[]
  getNullPercent: (col: string) => string
  getBooleanCounts: (col: string) => { trueCount: number, falseCount: number }
}

const TABULAR_CONTEXT_KEY: InjectionKey<TabularContext> = Symbol('tabular-context')

export function provideTabularContext(context: TabularContext) {
  provide(TABULAR_CONTEXT_KEY, context)
}

export function useTabularContext(): TabularContext {
  const context = inject(TABULAR_CONTEXT_KEY)
  if (!context) {
    throw new Error('useTabularContext() must be used inside a <TabularExplorer>')
  }
  return context
}
