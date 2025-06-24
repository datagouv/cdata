<template>
  <div class="space-y-5">
    <section
      v-if="status === 'success'"
      class="mb-5"
    >
      <h2 class="text-sm font-bold uppercase m-0 text-gray-title">
        {{ $t('{n} datasets', pageData.total) }}
      </h2>
      <div
        class="grid gap-5 mt-2"
        :class="{
          'lg:grid-cols-2': pageData.total > 1,
        }"
      >
        <DatasetCardLg
          v-for="dataset in pageData.data"
          :key="dataset.id"
          :dataset
          :show-description="pageData.total == 1"
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
    </section>
    <Divider class="my-10" />
    <section>
      <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 class="uppercase text-sm mb-0">
            {{ $t('Statistics for the last 12 months') }}
          </h2>
          <div class="text-gray-medium font-normal text-sm/6">
            <span v-if="new Date().getHours() > 7 - 1">{{ $t('Updated this morning') }}</span>
            <span v-else>{{ $t('Updated yesterday') }}</span>
          </div>
        </div>
        <div>
          <BrandedButton
            :disabled="!downloadStatsUrl"
            :href="downloadStatsUrl || ''"
            rel="ugc nofollow noopener"
            download="stats.csv"
            :icon="RiDownloadLine"
            color="secondary"
            size="xs"
            class="relative z-2"
          >
            {{ $t('Download the statistics as CSV') }}
          </BrandedButton>
        </div>
      </div>
      <div class="grid md:grid-cols-3">
        <StatBox
          :title="$t('Views')"
          :data="metricsViews"
          type="line"
          :summary="metricsViewsTotal"
          class="mb-8 md:mb-0"
        />
      </div>
    </section>
    <SectionCollapse
      :title="$t('Technical information')"
      :button-text="$t('See technical information')"
    >
      <DescriptionList class="mb-2">
        <div>
          <DescriptionListTerm>{{ $t('Latest update') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(dataservice.metadata_modified_at) }}</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('ID') }}</DescriptionListTerm>
          <DescriptionListDetails class="flex items-center gap-2">
            {{ dataservice.id }}
            <CopyButton
              class="!-mt-0.5"
              :label="$t(`Copier l'ID`)"
              :copied-label="$t('ID copied')"
              :text="dataservice.id"
              :hide-label="true"
            />
          </DescriptionListDetails>
        </div>
      </DescriptionList>
      <DescriptionList>
        <div>
          <DescriptionListTerm>{{ $t('Creation date') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(dataservice.created_at) }}</DescriptionListDetails>
        </div>
      </DescriptionList>
    </SectionCollapse>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, CopyButton, Pagination, StatBox, useFormatDate, type Dataservice, type DatasetV2 } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'
import Divider from '~/components/Divider.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataservice: Dataservice }>()

const config = useRuntimeConfig()
const { formatDate } = useFormatDate()

const pageSize = 6
const page = ref(1)

const query = computed(() => {
  return {
    dataservice: props.dataservice.id,
    page: page.value,
    page_size: pageSize,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { query })

const metricsViews = ref<null | Record<string, number>>(null)
const metricsViewsTotal = ref<null | number>(null)
watchEffect(async () => {
  if (!props.dataservice.id) return
  const response = await fetch(`${config.public.metricsApi}/api/dataservices/data/?dataservice_id__exact=${props.dataservice.id}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const views: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of page.data) {
    views[metric_month] = monthly_visit
  }
  // Fetching totals
  const totalResponse = await fetch(`${config.public.metricsApi}/api/dataservices_total/data/?dataservice_id__exact=${props.dataservice.id}`)
  const totalPage = await totalResponse.json()

  let totalViews = 0
  if (page.data[0]) {
    totalViews = totalPage.data[0].visit
  }
  metricsViews.value = views
  metricsViewsTotal.value = totalViews
})

const downloadStatsUrl = computed(() => {
  if (!metricsViews.value) return null

  let data = 'month,visit\n'

  for (const month in metricsViews) {
    data += `${month},${metricsViews[month]}\n`
  }

  return URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
})
</script>
