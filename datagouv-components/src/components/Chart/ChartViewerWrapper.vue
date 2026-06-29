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
import { computed, reactive, ref, watch } from 'vue'
import ChartViewer from './ChartViewer.vue'
import LoadingBlock from '../../components/LoadingBlock.vue'
import { useComponentsConfig } from '../../config'
import { fetchTabularData, useGetProfile } from '../../functions/tabularApi'
import type { Chart, ChartForApi, ColumnsDefinition } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'
import { watchDebounced } from '@vueuse/shared'
import { buildColumnsFromProfile } from '../../functions/charts'

const props = defineProps<{
  chart: Chart | ChartForApi
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
const getProfile = useGetProfile()

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref<Error | null>(null)

const pendingOperations = ref(0)

const series = reactive<{
  data: Record<string, Array<Record<string, unknown>>>
  columns: ColumnsDefinition
}>({
  data: {},
  columns: {},
})

const resourceIds = computed(() => {
  return props.chart.series
    .filter(s => s.resource_id)
    .map(s => s.resource_id)
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
      buildColumnsFromProfile(result.profile),
    ]))
  }
  catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch series profile')
    status.value = 'error'
    console.error(err)
    series.columns = {}
    series.data = {}
  }
  finally {
    pendingOperations.value--
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

watch(resourceIds, async () => {
  await fetchSeriesProfile()
}, { immediate: true })

watchDebounced([
  () => props.chart.series,
  () => props.chart.x_axis.column_x,
], async () => {
  await fetchSeriesData()
}, { debounce: config.searchDebounce ?? 300, immediate: true, deep: true })

watch(pendingOperations, (count) => {
  if (count === 0) {
    if (error.value === null && status.value === 'pending') {
      status.value = 'success'
    }
  }
})
</script>
