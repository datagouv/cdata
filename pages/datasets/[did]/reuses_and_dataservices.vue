<template>
  <div class="space-y-5">
    <div
      v-if="dataservices && dataservices.total"
      class="space-y-1"
    >
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('{n} API', { n: dataservices.total }) }}
      </div>
      <div class="space-y-2.5">
        <DataserviceCard
          v-for="dataservice in dataservices.data"
          :key="dataservice.id"
          :dataservice-url="dataservice.self_web_url"
          :dataservice
        />
        <Pagination
          :total-results="dataservices.total"
          :page-size="dataservices.page_size"
          :page="dataservices.page"
          @change="(newPage) => dataservicesPage = newPage"
        />
      </div>
    </div>
    <RecommendationsReuses :dataset />
    <div
      v-if="reuses && reuses.total"
      class="space-y-1"
    >
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('{n} réutilisations', { n: reuses.total }) }}
      </div>
      <div class="space-y-2.5">
        <div class="grid sm:grid-cols-3 gap-2.5">
          <ReuseCard
            v-for="reuse in reuses.data"
            :key="reuse.id"
            :reuse-url="reuse.page"
            :reuse
          />
        </div>
        <Pagination
          :total-results="reuses.total"
          :page-size="reuses.page_size"
          :page="reuses.page"
          @change="(newPage) => reusesPage = newPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataserviceCard, Pagination, type Dataservice, type DatasetV2, type Reuse } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'

const props = defineProps<{ dataset: DatasetV2 }>()

useSeoMeta({ robots: 'noindex' })

const dataservicesPage = ref(1)
const dataservicesQuery = computed(() => ({
  dataset: props.dataset.id,
  page: dataservicesPage.value,
  page_size: 5,
}))
const { data: dataservices } = await useAPI<PaginatedArray<Dataservice>>('/api/1/dataservices', { query: dataservicesQuery })

const reusesPage = ref(1)
const reusesQuery = computed(() => ({
  dataset: props.dataset.id,
  page: reusesPage.value,
  page_size: 6,
}))
const { data: reuses } = await useAPI<PaginatedArray<Reuse>>('/api/1/reuses', { query: reusesQuery })
</script>
