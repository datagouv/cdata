<template>
  <div v-if="groups.length || hasAnyResources">
    <ResourceExplorerHeader
      v-if="contextHeader"
      :dataset
      :resource="selectedResource"
      :exit-to="exitTo"
    />
    <div
      class="flex gap-6"
      :class="{ 'p-4 md:p-6': contextHeader }"
    >
      <div class="hidden md:block">
        <ResourceExplorerSidebar
          :groups
          :selected-resource-id="selectedResource?.id ?? null"
          :collapsed="sidebarCollapsed"
          :search
          :resource-to="resourceTo"
          replace
          @load-more="loadMore"
          @update:collapsed="sidebarCollapsed = $event"
          @update:search="updateSearch($event)"
        />
      </div>
      <div class="flex-1 min-w-0">
        <ResourceExplorerViewer
          v-if="selectedResource && groups.length"
          :key="selectedResource.id"
          :dataset
          :resource="selectedResource"
          :resources="flatResources"
          :resource-to="resourceTo"
          replace
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
import BrandedButton from '../BrandedButton.vue'

const props = withDefaults(defineProps<{
  dataset: DatasetV2
  noResultsImage?: string
  // Fullscreen mode: show the dataset context bar (org / title / date + download + exit).
  contextHeader?: boolean
  exitTo?: RouteLocationRaw
}>(), {
  noResultsImage: '',
  contextHeader: false,
})

const { t } = useTranslation()
const route = useRoute()

const {
  groups,
  flatResources,
  hasAnyResources,
  selectedResource,
  loadMore,
  search,
  updateSearch,
} = await useDatasetResources(() => props.dataset)

const sidebarCollapsed = ref(false)

const resourceTo = (resource: Resource): RouteLocationRaw => ({
  query: { ...route.query, resource_id: resource.id },
})
</script>
