import { computed, shallowRef, watch, type ComputedRef, type Ref } from 'vue'
import type { AsyncDataRequestStatus } from '../functions/api.types'

interface StableFacetsOptions<F> {
  data: Ref<{ facets: F } | null>
  status: Ref<AsyncDataRequestStatus>
  facetParams: Ref<Record<string, unknown>>
}

interface StableFacets<F> {
  facets: ComputedRef<F | null>
  loading: ComputedRef<boolean>
}

/**
 * Keeps facets stable across refetches that cannot change them (sort/page
 * changes): the cached facets object is kept instead of the new response's
 * copy, so facet filters neither re-render their counts nor flash loading.
 */
export function useStableFacets<F>(options: StableFacetsOptions<F>): StableFacets<F> {
  const { data, status, facetParams } = options
  const cachedFacets = shallowRef<F | null>(null)
  // facetParams only gets a new identity when its content changes
  const appliedFacetParams = shallowRef<Record<string, unknown> | null>(null)

  // Cache a response only if it answers the current facetParams.
  // Sort/page refetch: facetParams identity is unchanged and the new response
  // is a copy of the same aggregations — skip it to keep facets stable.
  watch(data, (results) => {
    if (!results) return
    if (facetParams.value !== appliedFacetParams.value) {
      cachedFacets.value = results.facets
      appliedFacetParams.value = facetParams.value
    }
  }, { immediate: true })

  const facets = computed(() => cachedFacets.value)

  // A change to a facet-affecting param updates facetParams and triggers a new fetch.
  //  While that fetch is pending, facetParams is ahead of the cached facets.
  const loading = computed(() =>
    status.value === 'pending' && facetParams.value !== appliedFacetParams.value,
  )

  return { facets, loading }
}
