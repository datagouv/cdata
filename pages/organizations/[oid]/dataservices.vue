<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm font-bold mb-0">
        {{ $t('{n} API', { n: results?.total ?? organization.metrics.dataservices }) }}
      </p>
      <div class="flex items-center">
        <label
          for="sort-dataservices"
          class="text-sm m-0 mr-2 whitespace-nowrap"
        >
          {{ $t('Trier par :') }}
        </label>
        <select
          id="sort-dataservices"
          v-model="sort"
          class="fr-select text-sm shadow-input-blue!"
        >
          <option :value="undefined">
            {{ $t('Popularité') }}
          </option>
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <ul
      v-if="results?.data.length"
      class="space-y-4 p-0 list-none"
    >
      <li
        v-for="dataservice in results.data"
        :key="dataservice.id"
        class="p-0"
      >
        <DataserviceCard :dataservice />
      </li>
    </ul>
    <Pagination
      v-if="results && results.total > pageSize"
      :page
      :page-size="pageSize"
      :total-results="results.total"
      class="mt-4"
      @change="(p: number) => page = p"
    />
  </div>
</template>

<script setup lang="ts">
import { DataserviceCard, Pagination, defaultDataserviceSortOptions, type Dataservice, type Organization, type PaginatedArray } from '@datagouv/components-next'
import { useRouteQuery } from '@vueuse/router'

const props = defineProps<{
  organization: Organization
}>()

const sortOptions = defaultDataserviceSortOptions
const sort = useRouteQuery<string | undefined>('sort')
const page = useRouteQuery('page', 1, { transform: Number })
const pageSize = 20

watch(sort, () => page.value = 1)

const params = computed(() => {
  const p: Record<string, unknown> = {
    organization: props.organization.id,
    page: page.value,
    page_size: pageSize,
  }
  if (sort.value) p.sort = sort.value
  return p
})

const { data: results } = await useAPI<PaginatedArray<Dataservice>>('/api/2/dataservices/search/', {
  params,
})
</script>
