<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/universe-search">
        {{ $t('Recherche par univers') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Universe Search
    </h1>

    <div
      v-if="universes.length"
      class="bg-white py-4 px-4 -mx-4"
    >
      <GlobalSearch :config="universes" />
    </div>
    <p v-else>
      Chargement des univers…
    </p>
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, defaultDatasetSortOptions, defaultReuseSortOptions } from '@datagouv/components-next'
import type { TopicV2, TopicElement, DatasetSearchFilters, ReuseSearchFilters, PaginatedArray, UniverseConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { data: topicsData } = await useAPI<PaginatedArray<TopicV2>>('/api/2/topics/', {
  lazy: true,
  server: false,
  query: { page_size: 50 },
})

const datasetFilterSets: (keyof DatasetSearchFilters)[][] = [
  ['organization', 'tag', 'format', 'license'],
  ['organization', 'geozone', 'granularity', 'badge'],
  ['organization', 'schema', 'license'],
]

const altDatasetSortOptions: typeof defaultDatasetSortOptions = [
  { value: '-created', label: 'Date de création' },
]

const universes = ref<UniverseConfig[]>([])

watch(
  () => topicsData.value?.data,
  async (topics) => {
    if (!topics) {
      universes.value = []
      return
    }
    const results = await Promise.all(
      topics.map(async (topic) => {
        const { data } = await useAPI<PaginatedArray<TopicElement>>(`/api/2/topics/${topic.id}/elements/?class=Dataset`)
        return { topic, total: data.value?.total ?? 0 }
      }),
    )
    universes.value = results
      .filter(({ total }) => total > 0)
      .slice(0, 5)
      .map(({ topic }, i) => ({
        key: topic.id,
        name: topic.name,
        topicId: topic.id,
        types: [
          {
            class: 'datasets' as const,
            basicFilters: datasetFilterSets[i % datasetFilterSets.length],
            sortOptions: i % 2 !== 0 ? defaultDatasetSortOptions : altDatasetSortOptions,
          },
          {
            class: 'dataservices' as const,
            basicFilters: ['organization'],
          },
          ...(i % 2 !== 0 ? [{ class: 'reuses' as const, basicFilters: ['organization'] as (keyof ReuseSearchFilters)[], sortOptions: defaultReuseSortOptions }] : []),
        ],
      }))
    if (universes.value.length === 0) console.warn('No test data found for universes')
  },
  { immediate: true },
)
</script>
