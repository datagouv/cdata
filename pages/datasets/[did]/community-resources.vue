<template>
  <div
    v-if="resources"
    class="space-y-5"
  >
    <SimpleBanner type="warning">
      {{ $t('Ces ressources sont publiées par la communauté et ne sont pas sous la responsabilité du producteur des données.') }}
    </SimpleBanner>
    <div class="space-y-1">
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('{n} community resources', { n: resources.total }) }}
      </div>
      <div class="space-y-2.5">
        <ResourceAccordion
          v-for="resource in resources.data"
          :key="resource.id"
          :dataset
          :resource
        />
        <Pagination
          :total-results="resources.total"
          :page-size="resources.page_size"
          :page="resources.page"
          @change="(newPage) => page = newPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, ResourceAccordion, SimpleBanner, type CommunityResource, type DatasetV2 } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataset: DatasetV2 }>()

const page = ref(1)
const query = computed(() => ({
  page: page.value,
  dataset: props.dataset.id,
  page_size: 5,
}))
const { data: resources } = await useAPI<PaginatedArray<CommunityResource>>('/api/1/datasets/community_resources', { query })
</script>
