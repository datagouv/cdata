<template>
  <LoadingBlock
    :status="status"
    :data="seriesData"
  >
    <ChartViewer
      :chart="chartWithData"
      :series-data="seriesData"
    />
    <template #error>
      <div class="text-center py-8 text-gray-500">
        Une erreur est survenue lors du chargement des données du graphique.
      </div>
    </template>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ChartViewer from './ChartViewer.vue'
import LoadingBlock from '../../components/LoadingBlock.vue'
import { useComponentsConfig } from '../../config'
import { fetchTabularData } from '../../functions/tabularApi'
import type { Chart } from '../../types/visualizations'
import type { TabularDataResponse } from '../../functions/tabularApi'

const props = defineProps<{
  chart: Chart
}>()

const config = useComponentsConfig()

// Loading and error states
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref<Error | null>(null)

// Dataset source for the chart
const seriesData = ref<Array<{ resource_id: string, data: Array<Array<unknown>> }> | null>(null)

// Fetch data for all series
const fetchSeriesData = async () => {
  status.value = 'pending'
  error.value = null

  try {
    if (!props.chart.series || props.chart.series.length === 0) {
      status.value = 'success'
      seriesData.value = null
      return
    }

    // Fetch data for all series in parallel
    const fetchPromises = props.chart.series.map(async (series) => {
      if (!series.resource_id) return null
      return await fetchTabularData(config, {
        resourceId: series.resource_id,
        page: 1,
        pageSize: 100,
      })
    })

    const results = await Promise.all(fetchPromises)
    const validResults = results.filter(Boolean) as Array<TabularDataResponse>

    // Transform data into echarts format
    // const source = combineSeriesData(validResults)
    seriesData.value = [
      ...validResults.map(result => ({
        resource_id: result.meta.resource_id || '',
        data: transformTabularDataToSource(result),
      })),
    ]

    status.value = 'success'
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series data')
    status.value = 'error'
    seriesData.value = null
  }
}

// Watch for changes in the chart or its series
watch(() => props.chart, async () => {
  await fetchSeriesData()
}, { immediate: true, deep: true })

/**
 * Transforms tabular data into a format suitable for echarts dataset source.
 * @param data - The tabular data response from the API
 * @returns An array suitable for echarts dataset source
 */
function transformTabularDataToSource(data: TabularDataResponse): Array<Array<unknown>> {
  if (!data.data || data.data.length === 0) {
    return []
  }

  // Get all unique column names from the data
  const columns = Array.from(new Set(data.data.flatMap(Object.keys)))

  // Build the source array with headers as the first row
  const source: Array<Array<unknown>> = [columns]

  // Add data rows
  data.data.forEach((row) => {
    const rowValues = columns.map(column => row[column])
    source.push(rowValues)
  })

  return source
}

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

const chartWithData = computed(() => props.chart)
</script>
