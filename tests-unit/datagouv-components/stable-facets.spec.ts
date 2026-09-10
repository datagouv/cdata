import { describe, expect, it } from 'vitest'
import { nextTick, ref, shallowRef } from 'vue'
import { useStableFacets } from '~/datagouv-components/src/composables/useStableFacets'
import type { AsyncDataRequestStatus } from '~/datagouv-components/src/functions/api.types'

type Facets = Record<string, { name: string, count: number }[]>

function setup() {
  // useFetch (the real data source) stores its payload in a shallowRef: facet
  // objects keep their identity, which is what the identity assertions below
  // rely on. A deep ref would wrap facets in reactive proxies.
  const data = shallowRef<{ facets: Facets } | null>(null)
  const status = ref<AsyncDataRequestStatus>('idle')
  const facetParams = ref<Record<string, unknown>>({})
  return { data, status, facetParams, ...useStableFacets<Facets>({ data, status, facetParams }) }
}

describe('useStableFacets', () => {
  it('exposes null facets before the first response', () => {
    const { facets } = setup()
    expect(facets.value).toBeNull()
  })

  it('exposes the facets of the first response', async () => {
    const { data, facets } = setup()
    const responseFacets = { format_family: [{ name: 'tabular', count: 3 }] }
    data.value = { facets: responseFacets }
    await nextTick()
    expect(facets.value).toBe(responseFacets)
  })

  it('keeps the previous facets when a refetch only changed sort or page', async () => {
    const { data, status, facets, loading } = setup()
    const responseFacets = { format_family: [{ name: 'tabular', count: 3 }] }
    data.value = { facets: responseFacets }
    await nextTick()

    // facetParams identity is unchanged (only sort/page changed)
    status.value = 'pending'
    await nextTick()
    expect(loading.value).toBe(false)

    data.value = { facets: { format_family: [{ name: 'tabular', count: 3 }] } }
    status.value = 'success'
    await nextTick()
    expect(facets.value).toBe(responseFacets)
  })

  it('recomputes facets when facet params change', async () => {
    const { data, status, facetParams, facets, loading } = setup()
    const initialFacets = { badge: [{ name: 'x', count: 1 }] }
    data.value = { facets: initialFacets }
    await nextTick()

    // A filter change gives facetParams a new identity (see useStableQueryParams)
    facetParams.value = { tag: 'energy' }
    status.value = 'pending'
    await nextTick()
    expect(loading.value).toBe(true)
    // The previous facets stay displayed while the fetch is in flight
    expect(facets.value).toBe(initialFacets)

    const newFacets = { badge: [{ name: 'y', count: 2 }] }
    data.value = { facets: newFacets }
    status.value = 'success'
    await nextTick()
    expect(facets.value).toBe(newFacets)
    expect(loading.value).toBe(false)
  })
})
