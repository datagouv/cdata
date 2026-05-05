<template>
  <div v-if="allResources.length || hasAnyResources">
    <div class="flex gap-6">
      <div class="flex-1 min-w-0">
        <div
          v-if="dataset.resources.total > 1"
          class="md:hidden flex justify-end mb-3"
        >
          <BrandedButton
            size="xs"
            color="secondary"
            :icon="RiListUnordered"
            @click="mobileSidebarOpen = true"
          >
            {{ t('Ressources ({count})', { count: dataset.resources.total }) }}
          </BrandedButton>
        </div>
        <ResourceExplorerViewer
          v-if="selectedResource && allResources.length"
          :key="selectedResource.id"
          :dataset
          :resource="selectedResource"
        />
        <div
          v-else-if="search"
          class="flex flex-col items-center py-12"
        >
          <slot name="no-results-image">
            <img
              :src="noResultsImage"
              class="h-20"
              alt=""
            >
          </slot>
          <p class="fr-text--bold fr-my-3v">
            {{ t('Pas de résultats pour « {q} »', { q: search }) }}
          </p>
          <BrandedButton
            color="primary"
            @click="updateSearch('')"
          >
            {{ t('Réinitialiser la recherche') }}
          </BrandedButton>
        </div>
      </div>
      <div class="hidden md:block">
        <ResourceExplorerSidebar
          :resources="allResources"
          :selected-resource-id="selectedResource?.id ?? null"
          :collapsed="sidebarCollapsed"
          :search
          @select="selectResource"
          @load-more="loadMore"
          @update:collapsed="sidebarCollapsed = $event"
          @update:search="updateSearch($event)"
        />
      </div>
    </div>

    <!-- Mobile sidebar panel -->
    <dialog
      ref="mobileSidebarDialog"
      class="mobile-sidebar md:hidden fixed inset-0 m-0 ml-auto p-0 h-dvh max-h-dvh w-80 max-w-[85vw] bg-white shadow-lg overflow-y-auto overscroll-contain backdrop:bg-black/30"
      @close="mobileSidebarOpen = false"
      @click.self="closeMobileSidebar"
    >
      <ResourceExplorerSidebar
        :resources="allResources"
        :selected-resource-id="selectedResource?.id ?? null"
        :collapsed="false"
        :search
        @select="selectResource"
        @load-more="loadMore"
        @update:collapsed="closeMobileSidebar"
        @update:search="updateSearch($event)"
      />
    </dialog>
  </div>
  <div
    v-else
    class="flex flex-col items-center py-12"
  >
    <slot name="empty-image">
      <img
        :src="noResultsImage"
        class="h-20"
        alt=""
      >
    </slot>
    <p class="fr-text--bold fr-my-3v">
      {{ t('Ce jeu de données ne contient aucune ressource.') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteQuery } from '@vueuse/router'
import { useComponentsConfig } from '../../config'
import { useTranslation } from '../../composables/useTranslation'
import { useDebouncedRef } from '../../composables/useDebouncedRef'
import { useFetch } from '../../functions/api'
import { RESOURCE_TYPE } from '../../functions/resources'
import type { PaginatedArray } from '../../types/api'
import type { DatasetV2 } from '../../types/datasets'
import type { Resource, ResourceGroup, ResourceType } from '../../types/resources'
import ResourceExplorerSidebar from './ResourceExplorerSidebar.vue'
import ResourceExplorerViewer from './ResourceExplorerViewer.vue'
import { RiListUnordered } from '@remixicon/vue'
import BrandedButton from '../BrandedButton.vue'

const props = withDefaults(defineProps<{
  dataset: DatasetV2
  noResultsImage?: string
}>(), {
  noResultsImage: '',
})

const { t } = useTranslation()
const router = useRouter()
const config = useComponentsConfig()

const sidebarCollapsed = ref(false)
const search = ref('')
const { debounced: searchDebounced, flush } = useDebouncedRef(search, config.searchDebounce ?? 300)

const PAGE_SIZE = 10
const url = computed(() => `/api/2/datasets/${props.dataset.id}/resources/`)

// Resource ID from URL query
const resourceIdQuery = useRouteQuery<string | undefined>('resource_id')

// Fetch resources for each type
const mainParams = computed(() => ({
  type: 'main' as const,
  page_size: PAGE_SIZE,
  q: searchDebounced.value || undefined,
}))
const documentationParams = computed(() => ({
  type: 'documentation' as const,
  page_size: PAGE_SIZE,
  q: searchDebounced.value || undefined,
}))
const updateParams = computed(() => ({
  type: 'update' as const,
  page_size: PAGE_SIZE,
  q: searchDebounced.value || undefined,
}))
const apiParams = computed(() => ({
  type: 'api' as const,
  page_size: PAGE_SIZE,
  q: searchDebounced.value || undefined,
}))
const codeParams = computed(() => ({
  type: 'code' as const,
  page_size: PAGE_SIZE,
  q: searchDebounced.value || undefined,
}))
const otherParams = computed(() => ({
  type: 'other' as const,
  page_size: PAGE_SIZE,
  q: searchDebounced.value || undefined,
}))

const { data: mainData, status: mainStatus } = await useFetch<PaginatedArray<Resource>>(url, { params: mainParams })
const { data: documentationData, status: documentationStatus } = await useFetch<PaginatedArray<Resource>>(url, { params: documentationParams, server: false })
const { data: updateData, status: updateStatus } = await useFetch<PaginatedArray<Resource>>(url, { params: updateParams, server: false })
const { data: apiData, status: apiStatus } = await useFetch<PaginatedArray<Resource>>(url, { params: apiParams, server: false })
const { data: codeData, status: codeStatus } = await useFetch<PaginatedArray<Resource>>(url, { params: codeParams, server: false })
const { data: otherData, status: otherStatus } = await useFetch<PaginatedArray<Resource>>(url, { params: otherParams, server: false })

const rawResourcesByTypes = [
  { data: mainData, status: mainStatus },
  { data: documentationData, status: documentationStatus },
  { data: updateData, status: updateStatus },
  { data: apiData, status: apiStatus },
  { data: codeData, status: codeStatus },
  { data: otherData, status: otherStatus },
]

// Evaluated once at setup (before any search) — never changes afterwards
const hasAnyResources = computed(() => {
  return props.dataset.resources.total > 0
})

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
  page_size: PAGE_SIZE,
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

const allResources = computed<ResourceGroup[]>(() => {
  return RESOURCE_TYPE
    .map((type, index) => {
      const rawData = rawResourcesByTypes[index]!
      const extraData = extraResourcesByType[index]!
      return {
        type: type as ResourceType,
        total: rawData.data.value?.total ?? 0,
        items: [...(rawData.data.value?.data ?? []), ...extraData.value],
      }
    })
    .filter(group => group.items.length > 0)
})

const flatResources = computed(() =>
  allResources.value.flatMap(g => g.items),
)

// Fetch resource by ID if specified in URL (for SSR)
const initialResourceId = resourceIdQuery.value
const mobileSidebarOpen = ref(false)
const mobileSidebarDialog = ref<HTMLDialogElement | null>(null)

watch(mobileSidebarOpen, (open) => {
  if (open) {
    mobileSidebarDialog.value?.showModal()
  }
  else {
    mobileSidebarDialog.value?.close()
  }
})

function closeMobileSidebar() {
  mobileSidebarOpen.value = false
}
const { data: fetchedResource } = initialResourceId
  ? await useFetch<Resource>(`/api/1/datasets/${props.dataset.id}/resources/${initialResourceId}/`)
  : { data: ref(null) }

// Initial selection (synchronous for SSR hydration)
function getInitialResource(): Resource | null {
  const resourceId = resourceIdQuery.value
  if (resourceId) {
    // First check in already loaded resources
    const existing = flatResources.value.find(r => r.id === resourceId)
    if (existing) return existing
    // Use fetched resource if available
    if (fetchedResource.value) return fetchedResource.value
  }
  // Default to first resource
  return flatResources.value[0] ?? null
}

const selectedResource = ref<Resource | null>(getInitialResource())

function updateSearch(newSearch: string) {
  search.value = newSearch
  flush()
}

const selectResource = (resource: Resource) => {
  selectedResource.value = resource
  mobileSidebarOpen.value = false
  router.replace({
    query: { ...router.currentRoute.value.query, resource_id: resource.id },
  })
}

// Update selection when resources change (e.g., after client-side fetch completes)
watch(flatResources, () => {
  if (selectedResource.value) return
  const firstResource = flatResources.value[0]
  if (firstResource) {
    selectedResource.value = firstResource
  }
})
</script>

<style>
html:has(dialog.mobile-sidebar[open]) {
  overflow: hidden;
}
</style>
