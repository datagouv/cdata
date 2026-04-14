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
        Une erreur est survenue lors du chargement des données du graphique.
      </div>
    </template>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import ChartViewer from './ChartViewer.vue'
import LoadingBlock from '../../components/LoadingBlock.vue'
import { useComponentsConfig } from '../../config'
import { fetchTabularData, useGetProfile, type TabularDataResponse, type TabularProfileResponse } from '../../functions/tabularApi'
import type { AndFilters, Chart, ChartForm, GenericFilter } from '../../types/visualizations'

const chart = defineModel<Chart | ChartForm>({ required: true })

const emit = defineEmits<{
  columns: [columns: Record<string, Array<string>>]
}>()

const config = useComponentsConfig()
const getProfile = useGetProfile()

// Loading and error states
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref<Error | null>(null)

// Dataset source for the chart
const series = reactive<{
  data: Record<string, Array<Record<string, unknown>>>
  columns: Record<string, Array<string>>
}>({
  data: {},
  columns: {},
})

async function fetchSeriesProfile() {
  status.value = 'pending'
  error.value = null

  try {
    if (chart.value.series.length === 0) {
      status.value = 'success'
      series.data = {}
      series.columns = {}
      return
    }

    // Fetch data for all series in parallel
    const fetchPromises = chart.value.series.map(async (serie) => {
      if (!serie.resource_id) return
      return {
        id: serie.resource_id,
        profile: await getProfile(serie.resource_id),
      }
    }).filter(Boolean) as Array<Promise<{
      id: string
      profile: TabularProfileResponse
    }>>

    const results = (await Promise.allSettled(fetchPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
    series.columns = Object.fromEntries(results.map(result => [
      result.id,
      result.profile.profile.header,
    ]))
    if (results.length > 0) {
      const columns = results[0]?.profile.profile.header ?? []
      const firstColumn = columns.filter(c => c !== '__id')[0]
      if (!chart.value.x_axis.column_x && firstColumn) {
        chart.value.x_axis.column_x = firstColumn
      }
    }
    status.value = 'success'
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series profile')
    status.value = 'error'
    console.log(err)
    series.columns = {}
  }
 }

 function isMultipleFilters(filter: GenericFilter): filter is AndFilters {
   return 'filters' in filter
 }

async function fetchSeriesData() {
  status.value = 'pending'
  error.value = null

  try {
    if (chart.value.series.length === 0 || !chart.value.x_axis.column_x) {
      status.value = 'success'
      series.data = {}
      return
    }

    // Fetch data for all series in parallel
    const fetchPromises = chart.value.series.map(async (serie) => {
      const xColumn = serie.column_x_name_override ?? chart.value.x_axis.column_x

      const filters = serie.filters ? serie.filters : {}

      if (!xColumn || !serie.resource_id || !serie.column_y) return
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
        }),
      }
    }).filter(Boolean) as Array<Promise<{
      id: string
      data: TabularDataResponse
    }>>

    const results = (await Promise.allSettled(fetchPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
    // Transform data into echarts format
    series.data = Object.fromEntries(results.map(result => [
      result.id,
      result.data.data,
    ]))
    status.value = 'success'
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series data')
    status.value = 'error'
    series.data = {}
  }
}

// Watch for changes in the chart or its series
watch(() => chart.value.series, async () => {
  await fetchSeriesProfile()
}, { immediate: true, deep: true })

// Watch for changes in the chart or its series
watch([() => chart.value.series, () => chart.value.x_axis.column_x], async () => {
  await fetchSeriesData()
}, { immediate: true, deep: true })

watch(() => series.columns, () => {
  emit('columns', series.columns)
})
</script>
