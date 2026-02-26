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
import { fetchTabularData, useGetProfile } from '../../functions/tabularApi'
import type { Chart, ChartForm } from '../../types/visualizations'

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

// Fetch data for all series
async function fetchSeriesData() {
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
      return {
        id: serie.resource_id,
        profile: await getProfile(serie.resource_id),
        data: await fetchTabularData(config, {
          resourceId: serie.resource_id,
          page: 1,
          pageSize: 100,
          groupBy: serie.column_x_name_override ?? chart.value.x_axis.column_x,
          aggregation: {
            column: serie.column_y,
            type: serie.aggregate_y,
          },
        }),
      }
    })

    const results = (await Promise.allSettled(fetchPromises))
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
    // Transform data into echarts format
    series.data = Object.fromEntries(results.map(result => [
      result.id,
      result.data.data,
    ]))
    series.columns = Object.fromEntries(results.map(result => [
      result.id,
      result.profile.profile.header,
    ]))
    if (results.length > 0) {
      const columns = Object.keys(results[0]?.data.data[0] ?? [])
      const firstColumn = columns.filter(c => c !== '__id')[0]
      if (!chart.value.x_axis.column_x && firstColumn) {
        chart.value.x_axis.column_x = firstColumn
      }
    }
    status.value = 'success'
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series data')
    status.value = 'error'
    console.log(err)
    series.data = {}
    series.columns = {}
  }
}

// Watch for changes in the chart or its series
watch(() => chart.value.series, async () => {
  await fetchSeriesData()
}, { immediate: true, deep: true })

watch(() => series.columns, () => {
  emit('columns', series.columns)
})

/**
 * Combines data from multiple series into a single echarts dataset source
 */
// function combineSeriesData(seriesData: Array<TabularDataResponse | null>): Array<Array<unknown>> {
//   if (!seriesData.length || seriesData.every(data => !data || !data.data || data.data.length === 0)) {
//     return []
//   }

//   // Get all unique columns from all series
//   const allColumns = Array.from(new Set(seriesData.flatMap(data =>
//     data?.data?.flatMap(Object.keys) || []
//   )))

//   // Build the source array with headers
//   const source: Array<Array<unknown>> = [allColumns]

//   // Add data rows - for simplicity, we'll use data from the first series
//   // In a real implementation, you'd want to merge/combine the data appropriately
//   const firstData = seriesData.find(data => data?.data?.length)?.data
//   if (firstData) {
//     firstData.forEach(row => {
//       const rowValues = allColumns.map(column => row[column])
//       source.push(rowValues)
//     })
//   }

//   return source
// }
</script>
