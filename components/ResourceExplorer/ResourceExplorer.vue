<template>
  <div v-if="allResources.length || hasAnyResources">
    <div class="flex gap-6">
      <div class="flex-1 min-w-0">
        <ResourceExplorerViewer
          v-if="selectedResource"
          :key="selectedResource.id"
          :dataset
          :resource="selectedResource"
        />
        <div
          v-else-if="search"
          class="flex flex-col items-center py-12"
        >
          <nuxt-img
            src="/illustrations/dataset.svg"
            class="h-20"
          />
          <p class="fr-text--bold fr-my-3v">
            {{ $t('Pas de résultats pour « {q} »', { q: search }) }}
          </p>
        </div>
      </div>
      <ResourceExplorerSidebar
        :resources="allResources"
        :selected-resource-id="selectedResource?.id ?? null"
        :collapsed="sidebarCollapsed"
        :search="search"
        @select="selectResource"
        @load-more="loadMore"
        @update:collapsed="sidebarCollapsed = $event"
        @update:search="search = $event"
      />
    </div>
  </div>
  <div
    v-else
    class="flex flex-col items-center py-12"
  >
    <nuxt-img
      src="/illustrations/dataset.svg"
      class="h-20"
    />
    <p class="fr-text--bold fr-my-3v">
      {{ $t('Ce jeu de données ne contient aucune ressource.') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { RESOURCE_TYPE, type DatasetV2, type Resource, type ResourceType } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import type { PaginatedArray } from '~/types/types'
import type { ResourceGroup } from './ResourceExplorerSidebar.vue'

const props = defineProps<{
  dataset: DatasetV2
}>()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const sidebarCollapsed = ref(false)
const search = ref('')
const searchDebounced = refDebounced(search, config.public.searchDebounce)

const PAGE_SIZE = 10
const url = computed(() => `/api/2/datasets/${props.dataset.id}/resources/`)

const rawResourcesByTypes = await Promise.all(
  RESOURCE_TYPE.map(type =>
    useAPI<PaginatedArray<Resource>>(url, {
      query: computed(() => ({
        type,
        page_size: PAGE_SIZE,
        q: searchDebounced.value || undefined,
      })),
    }),
  ),
)

// Evaluated once at setup (before any search) — never changes afterwards
const hasAnyResources = rawResourcesByTypes.some(r => (r.data.value?.total ?? 0) > 0)

const extraResourcesByType: Ref<Resource[]>[] = RESOURCE_TYPE.map(() => ref([]))
const pageByType: Ref<number>[] = RESOURCE_TYPE.map(() => ref(1))

watch(searchDebounced, () => {
  for (let i = 0; i < RESOURCE_TYPE.length; i++) {
    extraResourcesByType[i].value = []
    pageByType[i].value = 1
  }
})

const loadMore = async (type: ResourceType) => {
  const index = RESOURCE_TYPE.indexOf(type)
  if (index === -1) return
  pageByType[index].value++
  const result = await $api<PaginatedArray<Resource>>(url.value, {
    query: {
      type,
      page_size: PAGE_SIZE,
      page: pageByType[index].value,
      q: searchDebounced.value || undefined,
    },
  })
  extraResourcesByType[index].value = [...extraResourcesByType[index].value, ...result.data]
}

const allResources = computed<ResourceGroup[]>(() => {
  return RESOURCE_TYPE
    .map((type, index) => ({
      type: type as ResourceType,
      total: rawResourcesByTypes[index].data.value?.total ?? 0,
      items: [...(rawResourcesByTypes[index].data.value?.data ?? []), ...extraResourcesByType[index].value],
    }))
    .filter(group => group.items.length > 0)
})

const flatResources = computed(() =>
  allResources.value.flatMap(g => g.items),
)

const selectedResource = ref<Resource | null>(null)
const selectionInitialized = ref(false)

const selectResource = (resource: Resource) => {
  selectedResource.value = resource
  selectionInitialized.value = true
  router.replace({
    query: { ...route.query, resource_id: resource.id },
  })
}

// Initial selection: resource_id from URL, or first resource of the first group (in RESOURCE_TYPE order)
watchEffect(async () => {
  if (selectionInitialized.value) return

  const resourceId = route.query.resource_id as string | undefined
  if (resourceId) {
    const existing = flatResources.value.find(r => r.id === resourceId)
    if (existing) {
      selectedResource.value = existing
      selectionInitialized.value = true
      return
    }
    try {
      const fetched = await $api<Resource>(`/api/1/datasets/${props.dataset.id}/resources/${resourceId}/`)
      selectedResource.value = fetched
      selectionInitialized.value = true
      return
    }
    catch {
      // fallback below
    }
  }

  // Pick the first item of the first non-empty group (in RESOURCE_TYPE order: main first)
  if (flatResources.value.length > 0) {
    selectedResource.value = flatResources.value[0]
    selectionInitialized.value = true
  }
})
</script>
