import { computed, ref, watch, type Ref } from 'vue'
import type { SearchTypeConfig } from '../types/search'
import type { CustomFilterEntry } from './useSearchFilter'

type FilterRefs = Record<string, Ref<unknown>>

interface StableQueryParamsOptions {
  typeConfig: SearchTypeConfig | undefined
  allFilters: FilterRefs
  customFilterRegistry: Map<string, CustomFilterEntry>
  q: Ref<string>
  sort: Ref<string | undefined>
  page: Ref<number>
  pageSize: number
}

/**
 * Creates a stable ref for query params that only updates when content actually changes.
 * Applies hiddenFilters first, then user filters (which can override hiddenFilters).
 */
export function useStableQueryParams(options: StableQueryParamsOptions) {
  const { typeConfig, allFilters, customFilterRegistry, q, sort, page, pageSize } = options
  const stableParams = ref<Record<string, unknown>>({})

  const buildParams = () => {
    const params: Record<string, unknown> = {}

    // 1. Apply hiddenFilters first (can be overridden by user filters)
    if (typeConfig?.hiddenFilters) {
      for (const hf of typeConfig.hiddenFilters) {
        if (hf) {
          params[hf.key as string] = hf.value
        }
      }
    }

    // 2. Get enabled filters for this type
    const enabledFilters = [
      ...(typeConfig?.basicFilters ?? []),
      ...(typeConfig?.advancedFilters ?? []),
    ]

    // 3. Apply user filter values (only enabled ones)
    // Skip undefined/null/empty values so they're not sent to the API
    for (const filterName of enabledFilters) {
      const filterRef = allFilters[filterName as string]
      if (filterRef) {
        const value = filterRef.value
        if (value !== undefined && value !== '' && value !== null) {
          params[filterName as string] = value
        }
      }
    }

    // 3.5. Apply custom filter values
    for (const [, entry] of customFilterRegistry) {
      const value = entry.ref.value
      if (value !== undefined && value !== '' && value !== null) {
        const existing = params[entry.apiParam]
        if (existing !== undefined) {
          // Concatenate into array for multi-value params (e.g., tag)
          params[entry.apiParam] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value]
        }
        else {
          params[entry.apiParam] = value
        }
      }
    }

    // 4. Always include q, sort (if valid for this type), page, page_size
    if (q.value) {
      params.q = q.value
    }
    if (sort.value) {
      const validSortValues = typeConfig?.sortOptions?.map(o => o.value as string) ?? []
      if (validSortValues.includes(sort.value)) {
        params.sort = sort.value
      }
    }
    params.page = page.value
    params.page_size = pageSize

    return params
  }

  // Computed that reads all custom filter values, establishing reactive dependencies
  // on both the Map mutations (shallowReactive) and each entry's ref.value.
  const customFilterValues = computed(() => {
    const snapshot: Record<string, unknown> = {}
    for (const [urlParam, entry] of customFilterRegistry) {
      snapshot[urlParam] = entry.ref.value
    }
    return snapshot
  })

  // Watch all dependencies and update only if content changed
  watch(
    [q, sort, page, ...Object.values(allFilters), customFilterValues],
    () => {
      const newParams = buildParams()
      // JSON.stringify comparison is safe here because buildParams() builds the object deterministically
      // (keys are always added in the same order), avoiding the key ordering edge case.
      if (JSON.stringify(newParams) !== JSON.stringify(stableParams.value)) {
        stableParams.value = newParams
      }
    },
    { immediate: true },
  )

  return stableParams
}
