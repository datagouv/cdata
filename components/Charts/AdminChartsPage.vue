<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Graphiques') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Graphiques') }}
    </h1>

    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} graphiques | {n} graphique | {n} graphiques', pageData.total) }}
        </h2>
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: pageData }"
      :status
      :data="pageData"
    >
      <div v-if="pageData && pageData.total > 0">
        <div class="not-prose grid gap-4">
          <ChartCard
            v-for="chart in pageData.data"
            :key="chart.id"
            :chart
            :chart-url="`/admin/beta/charts/${chart.id}`"
          />
        </div>
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>

    <div
      v-if="status != 'pending' && pageData && !pageData.total"
      class="flex flex-col items-center"
    >
      <img
        src="/illustrations/chart.svg"
        class="h-20"
        alt=""
      >
      <p class="fr-text--bold fr-my-3v">
        {{ t(`Il n'y a pas encore de graphique sur le site`) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartCard, LoadingBlock, Pagination, type Chart } from '@datagouv/components-next'
import { ref } from 'vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import type { PaginatedArray } from '~/types/types'

const { t } = useTranslation()

const page = ref(1)
const pageSize = ref(20)

const params = computed(() => {
  return {
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<Chart>>('/api/1/visualizations/', { lazy: true, query: params })
</script>
