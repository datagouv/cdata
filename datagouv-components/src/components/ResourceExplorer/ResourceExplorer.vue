<template>
  <div
    v-if="groups.length || hasAnyResources"
    :class="fullscreen ? 'flex min-h-0 flex-1 flex-col' : ''"
  >
    <ResourceExplorerHeader
      v-if="fullscreen"
      class="shrink-0"
      :dataset
      :resource="selectedResource"
      :exit-to="exitTo"
    />
    <div
      class="flex"
      :class="fullscreen ? 'min-h-0 flex-1 overflow-hidden' : 'overflow-hidden rounded border border-gray-default'"
    >
      <div
        class="hidden md:flex"
        :class="resourceListExpanded ? 'flex-1' : ''"
      >
        <ResourceExplorerSidebar
          v-model:expanded="resourceListExpanded"
          :dataset
          :groups
          :selected-resource-id="selectedResource?.id ?? null"
          :collapsed="sidebarCollapsed"
          :search
          :loading-type="loadingType"
          :resource-to="resourceTo"
          replace
          @load-more="loadMore"
          @update:collapsed="sidebarCollapsed = $event"
          @update:search="updateSearch($event)"
        />
      </div>
      <div
        id="resource-explorer-viewer"
        class="flex-1 min-w-0"
        :class="[fullscreen ? 'flex flex-col' : '', resourceListExpanded ? 'md:hidden' : '']"
        role="region"
        :aria-label="t('Détail de la ressource')"
      >
        <!-- Suspense shows the skeleton fallback while the (async) viewer resolves
             its data on each resource switch. `timeout` keeps the previous resource
             visible for a beat so a near-instant switch doesn't flash a skeleton. -->
        <Suspense
          v-if="selectedResource"
          :timeout="200"
        >
          <ResourceExplorerViewer
            :key="selectedResource.id"
            :dataset
            :resource="selectedResource"
            :resources="flatResources"
            :resource-to="resourceTo"
            :explore-to="exploreTo"
            :resource-external-url="resourceExternalUrl"
            replace
            :fullscreen
          />
          <template #fallback>
            <ResourceViewerSkeleton
              :resource="selectedResource"
              :dataset
              :resources="flatResources"
              :resource-to="resourceTo"
              :explore-to="exploreTo"
              :resource-external-url="resourceExternalUrl"
              replace
              :fullscreen
            />
          </template>
        </Suspense>
        <!-- The selection never falls back to nothing once a resource has been shown,
             so having none means the groups aren't in yet: only `main` is fetched on
             the server, the other types arrive on hydration. -->
        <div
          v-else
          class="animate-pulse-placeholder p-4"
          :class="fullscreen ? 'min-h-0 flex-1' : ''"
          role="status"
          :aria-label="t('Chargement des ressources…')"
        >
          <div
            class="w-full rounded bg-gray-200"
            :class="fullscreen ? 'h-full' : 'h-96'"
          />
        </div>
      </div>
    </div>
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { useTranslation } from '../../composables/useTranslation'
import { useDatasetResources } from '../../composables/useDatasetResources'
import { TABULAR_FILTERS_PARAM, TABULAR_SEARCH_PARAM, TABULAR_SORT_PARAM } from '../../functions/tabular'
import type { DatasetV2 } from '../../types/datasets'
import type { Resource } from '../../types/resources'
import ResourceExplorerSidebar from './ResourceExplorerSidebar.vue'
import ResourceExplorerViewer from './ResourceExplorerViewer.vue'
import ResourceExplorerHeader from './ResourceExplorerHeader.vue'
import ResourceViewerSkeleton from './ResourceViewerSkeleton.vue'

const props = withDefaults(defineProps<{
  dataset: DatasetV2
  noResultsImage?: string
  // Fullscreen mode: dataset context bar (org / title / date + download + exit), the
  // viewer fills the height and hides its inline actions (shown in the context bar).
  fullscreen?: boolean
  exitTo?: RouteLocationRaw
  // Inline mode only: link builder for the "Explorer" button in the viewer header
  // that opens the fullscreen explorer on the current resource.
  exploreTo?: (resource: Resource) => string
  // Overrides the "Copier le lien" target.
  resourceExternalUrl?: (resource: Resource) => string
}>(), {
  noResultsImage: '',
  fullscreen: false,
})

// The dataset page's feedback link needs the resource currently shown; the URL
// query param is the source of truth inside, so we forward the resolved selection.
const emit = defineEmits<{
  select: [resource: Resource | null]
}>()

const { t } = useTranslation()
const route = useRoute()

const {
  groups,
  flatResources,
  hasAnyResources,
  selectedResource,
  loadMore,
  loadingType,
  search,
  updateSearch,
} = await useDatasetResources(() => props.dataset)

watch(selectedResource, resource => emit('select', resource), { immediate: true })

const sidebarCollapsed = ref(false)
const resourceListExpanded = ref(false)

// The filters and sort of the table name the columns of the resource they were
// set on: carried over, they would query columns the next one may not have. The
// search goes with them: it was typed for the content of the previous resource.
const resourceTo = (resource: Resource): RouteLocationRaw => {
  const { [TABULAR_FILTERS_PARAM]: _filters, [TABULAR_SORT_PARAM]: _sort, [TABULAR_SEARCH_PARAM]: _search, ...query } = route.query
  return { query: { ...query, resource_id: resource.id } }
}
</script>
