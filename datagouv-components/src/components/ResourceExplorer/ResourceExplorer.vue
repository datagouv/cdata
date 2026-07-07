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
        <ResourceExplorerViewer
          v-if="selectedResource"
          :key="selectedResource.id"
          :dataset
          :resource="selectedResource"
          :resources="flatResources"
          :resource-to="resourceTo"
          replace
          :bordered="false"
          :fullscreen
        />
        <div
          v-else
          class="flex h-full flex-col items-center justify-center gap-3 px-4 py-12 text-center"
        >
          <img
            :src="noResultsImage"
            class="h-16 opacity-60"
            alt=""
          >
          <p class="m-0 text-sm text-gray-medium">
            {{ t('Sélectionnez une ressource dans le menu pour l\'explorer.') }}
          </p>
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

const props = withDefaults(defineProps<{
  dataset: DatasetV2
  noResultsImage?: string
  // Fullscreen mode: dataset context bar (org / title / date + download + exit), the
  // viewer fills the height and hides its inline actions (shown in the context bar).
  fullscreen?: boolean
  exitTo?: RouteLocationRaw
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
