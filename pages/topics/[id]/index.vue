<template>
  <div class="space-y-8">
    <MarkdownViewer
      v-if="topic.description"
      class="w-full min-w-0"
      :content="topic.description"
      :min-heading="3"
    />

    <section v-if="datasets && datasets.total">
      <h2 class="uppercase text-sm mb-2.5">
        {{ $t('aucun jeu de données associé | {n} jeu de données associé | {n} jeux de données associés', { n: datasets.total }) }}
      </h2>
      <div
        class="grid gap-5"
        :class="{ 'lg:grid-cols-2': datasets.total > 1 }"
      >
        <DatasetCardLg
          v-for="dataset in datasets.data"
          :key="dataset.id"
          :dataset="dataset"
          :show-description="datasets.total === 1"
          class="m-0 min-w-0"
        />
      </div>
      <Pagination
        class="mt-4"
        :page="datasetsPage"
        :page-size="datasetsPageSize"
        :total-results="datasets.total"
        @change="(changedPage: number) => datasetsPage = changedPage"
      />
    </section>

    <section v-if="reuses && reuses.total">
      <h2 class="uppercase text-sm mb-2.5">
        {{ $t('aucune réutilisation associée | {n} réutilisation associée | {n} réutilisations associées', { n: reuses.total }) }}
      </h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ReuseCard
          v-for="reuse in reuses.data"
          :key="reuse.id"
          class="min-w-0"
          :reuse="reuse"
        />
      </div>
      <Pagination
        class="mt-4"
        :page="reusesPage"
        :page-size="reusesPageSize"
        :total-results="reuses.total"
        @change="(changedPage: number) => reusesPage = changedPage"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { MarkdownViewer, Pagination, type DatasetV2, type Reuse, type TopicV2 } from '@datagouv/components-next'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  topic: TopicV2
}>()

const datasetsPage = ref(1)
const datasetsPageSize = ref(10)
const datasetsQuery = computed(() => ({
  page: datasetsPage.value,
  page_size: datasetsPageSize.value,
  topic: props.topic.id,
}))
const { data: datasets } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { query: datasetsQuery })

const reusesPage = ref(1)
const reusesPageSize = ref(9)
const reusesQuery = computed(() => ({
  page: reusesPage.value,
  page_size: reusesPageSize.value,
  topic: props.topic.id,
}))
// We use the search endpoint for reuses because there is no v2 reuses index
// filtered by topic yet. Once udata#3800 is merged we can switch to the faster
// v2 index, like we already do for datasets above.
// If we ever need the TopicElement data (title/description/extras attached to
// the element), we could instead query /api/2/topics/{id}/elements/ for both
// datasets and reuses.
const { data: reuses } = await useAPI<PaginatedArray<Reuse>>('/api/2/reuses/search/', {
  headers: { 'X-Fields': reusesXFields },
  query: reusesQuery,
})
</script>
