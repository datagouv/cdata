import { computed, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useComponentsConfig } from '../config'
import { useDebouncedRef } from './useDebouncedRef'
import { useFetch } from '../functions/api'
import { RESOURCE_EXPLORER_PAGE_SIZE, RESOURCE_TYPE } from '../functions/resources'
import type { PaginatedArray } from '../types/api'
import type { DatasetV2 } from '../types/datasets'
import type { Resource, ResourceGroup, ResourceType } from '../types/resources'

// Fetches a dataset's resources grouped by type (paginated per type, searchable)
// and derives the currently selected resource from the `resource_id` query param.
// Shared by the dataset page and the explore page so the left navigation behaves
// identically in both.
export async function useDatasetResources(datasetGetter: MaybeRefOrGetter<DatasetV2>) {
  const config = useComponentsConfig()

  const search = ref('')
  const { debounced: searchDebounced, flush } = useDebouncedRef(search, config.searchDebounce ?? 300)

  const datasetId = computed(() => toValue(datasetGetter).id)
  const url = computed(() => `/api/2/datasets/${datasetId.value}/resources/`)

  const makeParams = (type: ResourceType) => computed(() => ({
    type,
    page_size: RESOURCE_EXPLORER_PAGE_SIZE,
    q: searchDebounced.value || undefined,
  }))

  // Only the main resources are fetched on the server: they are the most likely
  // to be looked at, the others are hydrated client-side to keep SSR light.
  const { data: mainData } = await useFetch<PaginatedArray<Resource>>(url, { params: makeParams('main') })
  const { data: documentationData } = await useFetch<PaginatedArray<Resource>>(url, { params: makeParams('documentation'), server: false })
  const { data: updateData } = await useFetch<PaginatedArray<Resource>>(url, { params: makeParams('update'), server: false })
  const { data: apiData } = await useFetch<PaginatedArray<Resource>>(url, { params: makeParams('api'), server: false })
  const { data: codeData } = await useFetch<PaginatedArray<Resource>>(url, { params: makeParams('code'), server: false })
  const { data: otherData } = await useFetch<PaginatedArray<Resource>>(url, { params: makeParams('other'), server: false })

  const rawDataByType = [mainData, documentationData, updateData, apiData, codeData, otherData]

  // Evaluated once at setup (before any search) — never changes afterwards
  const hasAnyResources = computed(() => toValue(datasetGetter).resources.total > 0)

  const extraResourcesByType: Ref<Resource[]>[] = RESOURCE_TYPE.map(() => ref<Resource[]>([]))
  const pageByType: Ref<number>[] = RESOURCE_TYPE.map(() => ref(1))

  watch(searchDebounced, () => {
    for (let i = 0; i < RESOURCE_TYPE.length; i++) {
      extraResourcesByType[i]!.value = []
      pageByType[i]!.value = 1
    }
  })

  // Separate useFetch for loadMore, initialized at setup time with immediate: false
  // so that it doesn't fetch until execute() is called from the event handler.
  const loadMoreType = ref<ResourceType>('main')
  const loadMorePage = ref(1)
  const loadMoreParams = computed(() => ({
    type: loadMoreType.value,
    page_size: RESOURCE_EXPLORER_PAGE_SIZE,
    page: loadMorePage.value,
    q: searchDebounced.value || undefined,
  }))
  const { data: loadMoreData, execute: executeLoadMore } = await useFetch<PaginatedArray<Resource>>(url, {
    params: loadMoreParams,
    immediate: false,
    watch: false,
  })

  const loadMore = async (type: ResourceType) => {
    const index = RESOURCE_TYPE.indexOf(type)
    if (index === -1) return
    const pageRef = pageByType[index]!
    const extraRef = extraResourcesByType[index]!
    pageRef.value++

    loadMoreType.value = type
    loadMorePage.value = pageRef.value
    await executeLoadMore()

    if (loadMoreData.value) {
      extraRef.value = [...extraRef.value, ...loadMoreData.value.data]
    }
  }

  const groups = computed<ResourceGroup[]>(() => {
    return RESOURCE_TYPE
      .map((type, index) => {
        const rawData = rawDataByType[index]!
        const extraData = extraResourcesByType[index]!
        return {
          type: type as ResourceType,
          total: rawData.value?.total ?? 0,
          items: [...(rawData.value?.data ?? []), ...extraData.value],
        }
      })
      .filter(group => group.items.length > 0)
  })

  const flatResources = computed(() => groups.value.flatMap(g => g.items))

  // Fetch the resource pointed at by `resource_id` (for SSR / deep links): it may
  // live beyond the first page of its type group, so it wouldn't be in flatResources.
  const resourceIdQuery = useRouteQuery<string | undefined>('resource_id')
  const initialResourceId = resourceIdQuery.value
  const { data: fetchedResource } = initialResourceId
    ? await useFetch<Resource>(`/api/1/datasets/${datasetId.value}/resources/${initialResourceId}/`)
    : { data: ref(null) }

  // The URL is the single source of truth for the selection: no ref to keep in
  // sync, navigation is done with plain links that change `resource_id`.
  const selectedResource = computed<Resource | null>(() =>
    flatResources.value.find(r => r.id === resourceIdQuery.value)
    ?? fetchedResource.value
    ?? flatResources.value[0]
    ?? null,
  )

  function updateSearch(newSearch: string) {
    search.value = newSearch
    flush()
  }

  return {
    groups,
    flatResources,
    hasAnyResources,
    selectedResource,
    loadMore,
    search,
    updateSearch,
  }
}
