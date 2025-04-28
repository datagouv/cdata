<template>
  <div
    v-if="status === 'success'"
    class="flex flex-wrap justify-between items-center mb-5"
  >
    <h2 class="text-sm font-bold uppercase m-0 text-gray-title">
      {{ $t('{n} datasets', pageData.total) }}
    </h2>

    <div class="grid grid-cols-2 gap-5">
      <DatasetCardLg
        v-for="dataset in pageData.data"
        :key="dataset.id"
        :dataset
        :show-description="false"
      />
    </div>
    <div class="w-full mt-6 flex justify-center">
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total-results="pageData.total"
        @change="(changedPage: number) => page = changedPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, type Dataservice, type DatasetV2 } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataservice: Dataservice }>()

const pageSize = 6
const page = ref(1)

const query = computed(() => {
  return {
    dataservice: props.dataservice.id,
    page: page.value,
    page_size: pageSize,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets', { query })
</script>
