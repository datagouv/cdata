<template>
  <LoadingBlock
    :status="status"
    :data="series"
  >
    <template #default="{ data }">
      <ChartViewer
        :chart="chart"
        :series="data"
      />
    </template>
    <template #error>
      <div class="text-center py-8 text-gray-500">
        {{ t('Une erreur est survenue lors du chargement des données du graphique.') }}
      </div>
    </template>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import ChartViewer from './ChartViewer.vue'
import LoadingBlock from '../../components/LoadingBlock.vue'
import { useComponentsConfig } from '../../config'
import { fetchTabularData, useGetProfile } from '../../functions/tabularApi'
import type { Chart, ChartForApi } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  chart: Chart | ChartForApi
  loadAllPages?: boolean
}>()

const emit = defineEmits<{
  columns: [columns: Record<string, Array<string>>]
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
const getProfile = useGetProfile()

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref<Error | null>(null)

const pendingOperations = ref(0)

const series = reactive<{
  data: Record<string, Array<Record<string, unknown>>>
  columns: Record<string, Array<string>>
  page: Record<string, number>
  hasNextPage: Record<string, boolean>
}>({
  data: {},
  columns: {},
  page: {},
  hasNextPage: {},
})

async function fetchSeriesProfile() {
  pendingOperations.value++
  status.value = 'pending'
  error.value = null

  try {
    if (props.chart.series.length === 0) {
      status.value = 'success'
      series.data = {}
      series.columns = {}
      return
    }

    const fetchPromises = props.chart.series
      .filter(serie => serie.resource_id)
      .map(async (serie) => {
        return {
          id: serie.resource_id,
          profile: await getProfile(serie.resource_id),
        }
      })

    const results = (await Promise.allSettled(fetchPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
    series.columns = Object.fromEntries(results.map(result => [
      result.id,
      result.profile.profile.header,
    ]))
    status.value = 'success'
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series profile')
    status.value = 'error'
    console.error(err)
    series.columns = {}
  }
  finally {
    pendingOperations.value--
  }
}

async function loadMorePages() {
  for (const serie of props.chart.series) {
    const xColumn = serie.column_x_name_override ?? props.chart.x_axis.column_x
    const resourceId = serie.resource_id
    if (!xColumn || !resourceId || !serie.column_y) continue

    if (!series.hasNextPage[resourceId]) {
      continue
    }

    const nextPage = (series.page[resourceId] || 0) + 1

    const response = await fetchTabularData(config, {
      columns: serie.aggregate_y ? undefined : [xColumn, serie.column_y],
      resourceId,
      page: nextPage,
      pageSize: 100,
      groupBy: xColumn,
      aggregation: serie.column_y && serie.aggregate_y
        ? {
            column: serie.column_y,
            type: serie.aggregate_y,
          }
        : undefined,
      filters: serie.filters ?? undefined,
    })

    series.page[resourceId] = nextPage

    if (!series.data[resourceId]) {
      series.data[resourceId] = []
    }
    series.data[resourceId] = [...series.data[resourceId], ...response.data]

    series.hasNextPage[resourceId] = !!response.links.next
  }
}

async function fetchSeriesData() {
  pendingOperations.value++
  status.value = 'pending'
  error.value = null

  try {
    if (props.chart.series.length === 0 || !props.chart.x_axis.column_x) {
      status.value = 'success'
      series.data = {}
      return
    }

    const fetchPromises = props.chart.series
      .filter((serie) => {
        const xColumn = serie.column_x_name_override ?? props.chart.x_axis.column_x
        return xColumn && serie.resource_id && serie.column_y
      })
      .map(async (serie) => {
        const xColumn = serie.column_x_name_override ?? props.chart.x_axis.column_x
        return {
          id: serie.resource_id,
          data: await fetchTabularData(config, {
            columns: serie.aggregate_y ? undefined : [xColumn, serie.column_y],
            resourceId: serie.resource_id,
            page: 1,
            pageSize: 100,
            groupBy: xColumn,
            aggregation: serie.column_y && serie.aggregate_y
              ? {
                  column: serie.column_y,
                  type: serie.aggregate_y,
                }
              : undefined,
            filters: serie.filters ?? undefined,
          }),
        }
      })

    const results = (await Promise.allSettled(fetchPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
    series.data = Object.fromEntries(results.map(result => [
      result.id,
      result.data.data,
    ]))

    for (const result of results) {
      const serie = props.chart.series.find(s => s.resource_id === result.id)
      if (serie) {
        series.page[result.id] = 0
        series.hasNextPage[result.id] = !!result.data.links.next
      }
    }

    if (props.loadAllPages) {
      await loadMorePages()
    }

    status.value = 'success'
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series data')
    status.value = 'error'
    series.data = {}
  }
  finally {
    pendingOperations.value--
  }
}

watch(() => props.chart.series, async () => {
  await fetchSeriesProfile()
}, { immediate: true, deep: true })

watch([() => props.chart.series, () => props.chart.x_axis.column_x], async () => {
  await fetchSeriesData()
}, { immediate: true, deep: true })

watch(() => series.columns, () => {
  emit('columns', series.columns)
})

watch(pendingOperations, (count) => {
  if (count === 0) {
    if (error.value === null && status.value === 'pending') {
      status.value = 'success'
    }
  }
})
</script>
