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
      <div class="hidden md:flex">
        <ResourceExplorerSidebar
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
        class="flex-1 min-w-0"
        :class="fullscreen ? 'flex flex-col' : ''"
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
              replace
              :fullscreen
            />
          </template>
        </Suspense>
        <!-- Nothing left to show, because the search emptied the navigation. The why
             and the way out belong to the sidebar, which carries the search field. -->
        <div
          v-else-if="search"
          class="flex h-full flex-col items-center justify-center gap-3 px-4 py-12 text-center"
        >
          <img
            :src="noResultsImage"
            class="h-16 opacity-60"
            alt=""
          >
          <p class="m-0 text-sm text-gray-medium">
            {{ t('Aucune ressource sélectionnée') }}
          </p>
        </div>
        <!-- Outside of a search the selection always falls back to the first resource,
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { useTranslation } from '../../composables/useTranslation'
import { useDatasetResources } from '../../composables/useDatasetResources'
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
}>(), {
  noResultsImage: '',
  fullscreen: false,
})

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

const sidebarCollapsed = ref(false)

const resourceTo = (resource: Resource): RouteLocationRaw => ({
  query: { ...route.query, resource_id: resource.id },
})
</script>
