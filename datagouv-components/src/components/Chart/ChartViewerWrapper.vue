<template>
  <LoadingBlock
    :status="status"
    :data="chartData"
  >
    <template #default="{ data }">
      <ChartViewer
        ref="chartViewerRef"
        :chart="data.config"
        :series="{ data: data.rows, columns: data.columns }"
      />
    </template>
    <template #error>
      <div class="text-center py-8 text-gray-500">
        {{ errorMessage }}
      </div>
    </template>
  </LoadingBlock>
  <div
    v-if="status === 'success' && !chartData"
    class="text-center py-8 text-gray-500"
  >
    {{ noDataMessage }}
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ChartViewer from './ChartViewer.vue'
import LoadingBlock from '../../components/LoadingBlock.vue'
import { useComponentsConfig } from '../../config'
import { ensureRowLimit, executeSqlQuery, type SqlQueryResult } from '../../functions/tabularApi'
import type { Chart, ChartViewerConfig, ColumnsDefinition } from '../../types/visualizations'
import type { ColumnType } from '../TabularExplorer/types'
import { inferChartConfig } from '../../functions/charts'
import { useTranslation } from '../../composables/useTranslation'
import { watchDebounced } from '@vueuse/shared'

const props = defineProps<{
  chart: Pick<Chart, 'query' | 'resource_id' | 'y_axis' | 'chart_type'>
  tabularApiUrl?: string
}>()

const { t } = useTranslation()
const chartViewerRef = ref<InstanceType<typeof ChartViewer> | null>(null)

function capture(): string | null {
  return chartViewerRef.value?.capture() ?? null
}

defineExpose({ capture })

const config = useComponentsConfig()

const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const queryResult = ref<SqlQueryResult | null>(null)
const error = ref<Error | null>(null)

const errorMessage = computed(() => {
  return error.value?.message ?? t('Une erreur est survenue lors du chargement des données du graphique.')
})

// Date.parse accepts bare years and numeric identifiers, so require a date prefix.
const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}(?:[T ]|$)/

function isDateValue(value: string): boolean {
  return ISO_DATE_PREFIX.test(value) && !Number.isNaN(Date.parse(value))
}

function inferXColumnType(result: SqlQueryResult, xColumn: string): ColumnType {
  const index = result.columns.indexOf(xColumn)
  const values = result.rows.map(row => row[index]).filter(value => value !== null && value !== undefined)
  if (values.length > 0 && values.every(value => typeof value === 'string' && isDateValue(value))) {
    return 'date'
  }
  if (values.length > 0 && values.every(value => typeof value === 'number')) {
    // Irregular numeric identifiers belong on a categorical axis.
    const unique = [...new Set(values as number[])].sort((a, b) => a - b)
    if (unique.length < 2) return 'categorical'
    const gaps = unique.slice(1).map((value, index) => value - unique[index]!)
    const meanGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    const variance = gaps.reduce((sum, gap) => sum + (gap - meanGap) ** 2, 0) / gaps.length
    return Math.sqrt(variance) / meanGap < 0.15 ? 'number' : 'categorical'
  }
  return 'categorical'
}

type ChartViewerData = {
  config: ChartViewerConfig
  rows: Record<string, Array<Record<string, unknown>>>
  columns: ColumnsDefinition
}

// Why the result cannot be plotted, to surface a meaningful message instead
// of a bare "no data": rows may exist but carry no numeric column for Y.
const noDataReason = computed<'empty' | 'no-numeric-series' | null>(() => {
  if (status.value !== 'success') return null
  const result = queryResult.value
  if (!result || result.rows.length === 0) return 'empty'
  const { xColumn, seriesColumns } = inferChartConfig(result)
  if (!xColumn || seriesColumns.length === 0) return 'no-numeric-series'
  return null
})

const noDataMessage = computed(() =>
  noDataReason.value === 'no-numeric-series'
    ? t('Aucune colonne numérique à tracer : agrégez une colonne numérique (SUM, COUNT, AVG…) pour l\'ordonnée.')
    : t('Aucune donnée'),
)

const chartData = computed<ChartViewerData | null>(() => {
  const result = queryResult.value
  if (!result || result.rows.length === 0) return null

  const { xColumn, seriesColumns } = inferChartConfig(result)
  if (!xColumn || seriesColumns.length === 0) return null

  // The rendered kind always comes from the chart's chart_type field; inference
  // only picks the X column and the series columns.
  const xColumnType = inferXColumnType(result, xColumn)
  const isHistogram = props.chart.chart_type === 'histogram'

  const rows = result.rows.map((row) => {
    return Object.fromEntries(result.columns.map((column, index) => [column, row[index] ?? null]))
  })

  const columns: ColumnsDefinition = {
    [props.chart.resource_id]: [
      { name: xColumn, type: xColumnType },
      ...seriesColumns.map(name => ({ name, type: 'number' as ColumnType })),
    ],
  }

  return {
    config: {
      x_axis: {
        column_x: xColumn,
        sort_x_by: null,
        sort_x_direction: null,
        type: xColumnType === 'categorical' ? 'discrete' : 'continuous',
      },
      y_axis: props.chart.y_axis,
      series: seriesColumns.map(column_y => ({
        type: isHistogram ? 'histogram' : 'line',
        column_y,
        aggregate_y: null,
        resource_id: props.chart.resource_id,
        column_x_name_override: null,
      })),
    },
    rows: { [props.chart.resource_id]: rows },
    columns,
  }
})

// Guards against a stale response overwriting the chart of a newer query.
let requestSequence = 0

async function runQuery() {
  const sequence = ++requestSequence
  const tabularApiUrl = props.tabularApiUrl ?? config.tabularApiUrl
  const { query, resource_id: resourceId } = props.chart

  if (!tabularApiUrl || !query || !resourceId) {
    status.value = 'success'
    queryResult.value = null
    error.value = null
    return
  }

  status.value = 'pending'
  error.value = null

  try {
    const result = await executeSqlQuery(tabularApiUrl, resourceId, ensureRowLimit(query))
    if (sequence !== requestSequence) return
    queryResult.value = result
    status.value = 'success'
  }
  catch (err) {
    if (sequence !== requestSequence) return
    console.error(err)
    error.value = err instanceof Error ? err : new Error(String(err))
    queryResult.value = null
    status.value = 'error'
  }
}

watchDebounced(
  () => [props.chart.query, props.chart.resource_id, props.tabularApiUrl],
  runQuery,
  { debounce: config.searchDebounce ?? 300, immediate: true },
)
</script>
