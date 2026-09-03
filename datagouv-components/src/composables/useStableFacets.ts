import { computed, shallowRef, watch, type ComputedRef, type Ref } from 'vue'
import type { AsyncDataRequestStatus } from '../functions/api.types'

interface StableFacetsOptions<F> {
  /** Latest search response for one search type (null until the first response). */
  data: Ref<{ facets: F } | null>
  /** Fetch status for that response. */
  status: Ref<AsyncDataRequestStatus>
  /** Stable params that affect facet aggregations (see useStableQueryParams). */
  facetParams: Ref<Record<string, unknown>>
}

interface StableFacets<F> {
  facets: ComputedRef<F | null>
  loading: ComputedRef<boolean>
}

/**
 * Keeps the facets of a search response stable across refetches that cannot
 * change them. Facet aggregations only depend on the query and the filters, so
 * a refetch triggered by a sort or page change returns the same facets: the
 * cached object is kept (stable identity, no re-render and no loading flash on
 * the facet filters) instead of being replaced by the new response's copy.
 */
export function useStableFacets<F>(options: StableFacetsOptions<F>): StableFacets<F> {
  const { data, status, facetParams } = options
  const cachedFacets = shallowRef<F | null>(null)
  // facetParams only gets a new identity when its content changes
  // (see useStableQueryParams), so !== is a content comparison.
  const appliedFacetParams = shallowRef<Record<string, unknown> | null>(null)

  // Only watch data: when facetParams change, a fetch is in flight and the
  // current data is stale, so it must not be cached under the new params.
  watch(data, (results) => {
    if (!results) return
    if (facetParams.value !== appliedFacetParams.value) {
      cachedFacets.value = results.facets
      appliedFacetParams.value = facetParams.value
    }
  }, { immediate: true })

  const facets = computed(() => cachedFacets.value)

  // Facets are only "loading" while a fetch that can change them is in flight.
  const loading = computed(() =>
    status.value === 'pending' && facetParams.value !== appliedFacetParams.value,
  )

  return { facets, loading }
}
