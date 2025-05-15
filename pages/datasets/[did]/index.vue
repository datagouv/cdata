<template>
  <div class="space-y-5">
    <div
      v-for="{ data }, index in resourcesByTypes"
      :key="RESOURCE_TYPE[index]"
      class="space-y-1"
    >
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('{n} {label}', { n: data.value.total, label: getResourceLabel(RESOURCE_TYPE[index]) }) }}
      </div>
      <div class="space-y-2.5">
        <SearchInput
          v-if="data.value.total > data.value.page_size || searchByResourceType[index].value"
          v-model="searchByResourceType[index].value"
          :placeholder="$t('Rechercher')"
        />
        <ResourceAccordion
          v-for="resource in data.value.data"
          :key="resource.id"
          :dataset
          :resource
        />
        <Pagination
          :total-results="data.value.total"
          :page-size="data.value.page_size"
          :page="data.value.page"
          @change="(newPage) => pageByResourceType[index].value = newPage"
        />
      </div>
    </div>
    <RecommendationsDatasets :dataset />
  </div>
</template>

<script setup lang="ts">
import { getResourceLabel, Pagination, RESOURCE_TYPE, ResourceAccordion, type DatasetV2, type Resource } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataset: DatasetV2 }>()

const url = computed(() => `/api/2/datasets/${props.dataset.id}/resources`)

const pageSize = ref(10)

const pageByResourceType: Array<Ref<number>> = RESOURCE_TYPE.map(() => ref(1))
const searchByResourceType: Array<Ref<string>> = RESOURCE_TYPE.map(() => ref(''))

const queryParamsByResourceType = RESOURCE_TYPE.map((type, index) => {
  return computed(() => ({
    type,
    page_size: pageSize.value,
    page: pageByResourceType[index].value,
    q: searchByResourceType[index].value,
  }))
})

const rawResourcesByTypes = await Promise.all(
  RESOURCE_TYPE.map((type, index) => useAPI<PaginatedArray<Resource>>(url, { query: queryParamsByResourceType[index] })),
)

const resourcesByTypes = computed(() => {
  return rawResourcesByTypes.filter(result => result.data.value.total > 0)
})
</script>
