import { ref, watch, type Ref } from 'vue'
import type { SearchTypeConfig } from '../types/search'

type FilterRefs = Record<string, Ref<unknown>>

interface StableQueryParamsOptions {
  typeConfig: SearchTypeConfig | undefined
  allFilters: FilterRefs
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
  const { typeConfig, allFilters, q, sort, page, pageSize } = options
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

    // 4. Always include q, sort, page, page_size
    if (q.value) {
      params.q = q.value
    }
    if (sort.value) {
      params.sort = sort.value
    }
    params.page = page.value
    params.page_size = pageSize

    return params
  }

  // Watch all dependencies and update only if content changed
  watch(
    [q, sort, page, ...Object.values(allFilters)],
    () => {
      const newParams = buildParams()
      if (JSON.stringify(newParams) !== JSON.stringify(stableParams.value)) {
        stableParams.value = newParams
      }
    },
    { immediate: true },
  )

  return stableParams
}
