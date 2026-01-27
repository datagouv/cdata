<template>
  <div v-if="allResources.length">
    <div class="flex gap-6">
      <div class="flex-1 min-w-0">
        <ResourceExplorerViewer
          v-if="selectedResource"
          :key="selectedResource.id"
          :dataset
          :resource="selectedResource"
        />
      </div>
      <ResourceExplorerSidebar
        :resources="allResources"
        :selected-resource-id="selectedResource?.id ?? null"
        :collapsed="sidebarCollapsed"
        :search="search"
        @select="selectResource"
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

const url = computed(() => `/api/2/datasets/${props.dataset.id}/resources/`)

const rawResourcesByTypes = await Promise.all(
  RESOURCE_TYPE.map(type =>
    useAPI<PaginatedArray<Resource>>(url, {
      query: computed(() => ({
        type,
        page_size: 50,
        q: searchDebounced.value || undefined,
      })),
    }),
  ),
)

const allResources = computed<ResourceGroup[]>(() => {
  return RESOURCE_TYPE
    .map((type, index) => ({
      type: type as ResourceType,
      items: rawResourcesByTypes[index].data.value?.data ?? [],
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

// Sélection initiale : resource_id de l'URL ou premier fichier du premier groupe (dans l'ordre RESOURCE_TYPE)
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
      // fallback ci-dessous
    }
  }

  // Prend le 1er élément du 1er groupe non-vide (dans l'ordre RESOURCE_TYPE : main d'abord)
  if (flatResources.value.length > 0) {
    selectedResource.value = flatResources.value[0]
    selectionInitialized.value = true
  }
})
</script>
