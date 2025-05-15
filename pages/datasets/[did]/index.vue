<template>
  <div class="space-y-5">
    <div
      v-for="{ data, status }, index in resourcesByTypes"
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
        <div>
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
        <div>
          <div
            v-if="status.value != 'pending' && data.value && !data.value.total"
            class="flex flex-col items-center"
          >
            <nuxt-img
              src="/illustrations/dataset.svg"
              class="h-20"
            />
            <p class="fr-text--bold fr-my-3v">
              {{ $t(`No results for "{q}"`, { q: searchByResourceType[index].value }) }}
            </p>
            <BrandedButton
              color="primary"
              @click="searchByResourceType[index].value = ''"
            >
              {{ $t('Reset filters') }}
            </BrandedButton>
          </div>
        </div>
      </div>
    </div>
    <RecommendationsDatasets :dataset />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, getResourceLabel, Pagination, RESOURCE_TYPE, ResourceAccordion, type DatasetV2, type Resource } from '@datagouv/components-next'
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
  const result = {} as Record<number, typeof rawResourcesByTypes[number]>
  for (const index in rawResourcesByTypes) {
    if (rawResourcesByTypes[index].data.value.total > 0 || searchByResourceType[index].value) {
      result[index] = rawResourcesByTypes[index]
    }
  }
  return result
})
</script>
