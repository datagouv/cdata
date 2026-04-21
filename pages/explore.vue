<template>
  <div class="container py-8">
    <h1 class="mb-6">
      Explore
    </h1>

    <div
      v-if="!resourceId"
      class="space-y-6"
    >
      <div class="flex flex-wrap gap-2">
        <button
          class="fr-btn fr-btn--secondary fr-btn--sm"
          @click="selectResource('eaa95292-072d-4353-a6b8-1be65be0ab0f')"
        >
          Petitions du Sénat
        </button>
      </div>

      <form
        class="fr-search-bar fr-search-bar--lg w-full"
        @submit.prevent="() => execute()"
      >
        <label
          for="search-input"
          class="sr-only"
        >Rechercher un jeu de données</label>
        <input
          id="search-input"
          v-model="query"
          type="search"
          class="input max-h-12 m-0 rounded-tl shadow-input-blue"
          placeholder="Rechercher un jeu de données..."
        >
        <button
          class="fr-btn"
          type="submit"
        >
          Rechercher
        </button>
      </form>

      <p
        v-show="status === 'pending'"
        class="text-sm text-gray-500"
      >
        Chargement...
      </p>

      <div
        v-if="displayedDatasets.length > 0"
        class="space-y-4"
      >
        <p class="text-sm text-gray-500">
          {{ results!.total }} résultat{{ results!.total > 1 ? 's' : '' }}
        </p>
        <div
          v-for="dataset in displayedDatasets"
          :key="dataset.id"
          class="border rounded p-4 space-y-2"
        >
          <p class="font-bold">
            {{ dataset.title }}
          </p>
          <p
            v-if="dataset.organization"
            class="text-sm text-gray-500"
          >
            {{ dataset.organization.name }}
          </p>
          <div class="space-y-1">
            <button
              v-for="resource in explorableResources(dataset)"
              :key="resource.id"
              class="flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-blue-50 w-full text-left transition-colors"
              @click="selectResource(resource.id)"
            >
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                {{ resource.format }}
              </span>
              <span>{{ resource.title }}</span>
              <span
                v-if="resource.filesize"
                class="text-gray-400 text-xs ml-auto"
              >
                {{ filesize(resource.filesize) }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <p
        v-else-if="results && status === 'success'"
        class="text-sm text-gray-500 italic"
      >
        Aucun résultat
      </p>
    </div>

    <div v-else>
      <button
        class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm mb-4"
        @click="resourceId = ''"
      >
        &larr; Retour à la recherche
      </button>
      <TabularExplorer
        :key="resourceId"
        :resource-id="resourceId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TabularExplorer, filesize, useHasTabularData } from '@datagouv/components-next'
import type { Dataset } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

useSeoMeta({ robots: 'noindex' })

const query = ref('')
const resourceId = ref('')

const searchParams = computed(() => ({ q: query.value, page_size: 10 }))

const { data: results, status, execute } = await useAPI<PaginatedArray<Dataset>>(
  '/api/1/datasets/',
  {
    query: searchParams,
    immediate: false,
    watch: false,
  },
)

const hasTabularData = useHasTabularData()

function explorableResources(dataset: Dataset) {
  return dataset.resources.filter(hasTabularData)
}

const displayedDatasets = computed(() =>
  results.value?.data.filter(dataset => explorableResources(dataset).length > 0) ?? [],
)

function selectResource(id: string) {
  resourceId.value = id
}
</script>
