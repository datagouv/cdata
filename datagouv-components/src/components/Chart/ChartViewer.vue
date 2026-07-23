<template>
  <div
    ref="chartContainer"
    class="w-full min-h-96"
  />
</template>

<script setup lang="ts">
import { format, use, type ComposeOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, type BarSeriesOption, type LineSeriesOption } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent } from 'echarts/components'
import { init, type ECharts as EChartsType } from 'echarts'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { summarize } from '../../functions/helpers'
import { useFormatDate } from '../../functions/dates'
import type { Chart, ColumnDefinition, ColumnsDefinition, XAxis, YAxis, XAxisForm, ChartForApi } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart | ChartForApi
  series: {
    data: Record<string, Array<Record<string, unknown>>>
    columns: ColumnsDefinition
  }
}>()

const { locale } = useTranslation()
const { formatDate } = useFormatDate()
const chartContainer = ref<HTMLElement | null>(null)
let echartsInstance: EChartsType | null = null

function capture(): string | null {
  return echartsInstance?.getDataURL() ?? null
}

defineExpose({ capture })

// ECharts has a dedicated 'time' axis type for continuous date values.
function mapXAxisType(xAxis: XAxis | XAxisForm): 'category' | 'value' | 'time' {
  if (!xAxis) return 'category'
  if (xAxis.type !== 'continuous') return 'category'
  return isDateAxis.value ? 'time' : 'value'
}

function buildYAxisFormatter(yAxis: YAxis): ((value: number) => string) | undefined {
  return (value: number) => {
    const v = summarize(value)
    if (!yAxis.unit) return v
    if (yAxis.unit_position === 'prefix') return `${yAxis.unit} ${v}`
    return `${v} ${yAxis.unit}`
  }
}

function buildXAxisFormatter(column: ColumnDefinition | null, options?: Intl.DateTimeFormatOptions): ((value: string | number | Date) => string) | undefined {
  if (column?.type !== 'date') return undefined
  return (value: string | number | Date) => {
    if (value === null || value === undefined) return ''
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return formatDate(date, options ?? { dateStyle: 'short' })
  }
}

function parseXValueAsDate(row: Record<string, unknown>, xColumn: string): Record<string, unknown> {
  const value = row[xColumn]
  if (value === null || value === undefined || value instanceof Date) return row
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return { ...row, [xColumn]: date }
    }
  }
  return row
}

const xAxisColumn = computed(() => {
  const columnName = props.chart.x_axis.column_x
  if (!columnName) return null
  for (const columns of Object.values(props.series.columns)) {
    const column = columns.find(c => c.name === columnName)
    if (column) return column
  }
  return null
})

const isDateAxis = computed(() => xAxisColumn.value?.type === 'date')

const xAxisBounds = computed(() => {
  const columnName = props.chart.x_axis.column_x
  if (!columnName) return { min: undefined, max: undefined }

  let min: number | undefined
  let max: number | undefined

  for (const s of props.chart.series) {
    const xColumn = s.column_x_name_override ?? columnName
    const data = props.series.data[s.resource_id]
    if (!data) continue

    for (const row of data) {
      const value = row[xColumn]
      if (value === null || value === undefined) continue

      let numericValue: number | undefined
      if (value instanceof Date) {
        numericValue = value.getTime()
      }
      else if (isDateAxis.value && typeof value === 'string') {
        numericValue = new Date(value).getTime()
      }
      else {
        numericValue = Number(value)
      }

      if (numericValue === undefined || Number.isNaN(numericValue)) continue

      if (min === undefined || numericValue < min) min = numericValue
      if (max === undefined || numericValue > max) max = numericValue
    }
  }

  return { min, max }
})

const echartsOption = computed(() => {
  const seriesCount = props.chart.series.length
  if (!props.chart.series || seriesCount === 0) return

  const seriesArray = props.chart.series.map((s) => {
    const xColumn = s.column_x_name_override ?? props.chart.x_axis.column_x
    const yColumn = s.aggregate_y ? `${s.column_y}__${s.aggregate_y}` : s.column_y
    const resourceId = s.resource_id

    const resourceColumns = props.series.columns[resourceId]
    if (!xColumn || !yColumn || !resourceId || !s.type || !props.series.data[resourceId] || !resourceColumns) {
      return null
    }

    const rawData = props.series.data[resourceId]
    const sortedData = isDateAxis.value
      ? rawData.map(row => parseXValueAsDate(row, xColumn))
      : [...rawData]
    const sortBy = props.chart.x_axis.sort_x_by ?? (isDateAxis.value ? 'axis_x' : null)
    const sortDirection = props.chart.x_axis.sort_x_direction ?? 'asc'

    if (sortBy && sortDirection && props.chart.x_axis.column_x) {
      const sortKey = sortBy === 'axis_y' ? yColumn : xColumn
      sortedData.sort((a, b) => {
        const valA = a[sortKey]
        const valB = b[sortKey]

        const aNullish = valA === null || valA === undefined
        const bNullish = valB === null || valB === undefined
        if (aNullish && bNullish) return 0
        if (aNullish) return sortDirection === 'asc' ? -1 : 1
        if (bNullish) return sortDirection === 'asc' ? 1 : -1

        if (valA instanceof Date && valB instanceof Date) {
          const timeA = valA.getTime()
          const timeB = valB.getTime()
          if (timeA < timeB) return sortDirection === 'asc' ? -1 : 1
          if (timeA > timeB) return sortDirection === 'asc' ? 1 : -1
          return 0
        }

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          if (valA === valB) return 0
          // false comes before true in ascending order
          if (valB) return sortDirection === 'asc' ? -1 : 1
          return sortDirection === 'asc' ? 1 : -1
        }

        const numA = Number(valA)
        const numB = Number(valB)
        const bothNumeric = !isNaN(numA) && !isNaN(numB)

        if (bothNumeric) {
          if (numA < numB) return sortDirection === 'asc' ? -1 : 1
          if (numA > numB) return sortDirection === 'asc' ? 1 : -1
          return 0
        }

        const strA = String(valA)
        const strB = String(valB)
        return strA.localeCompare(strB, locale, {
          sensitivity: 'base',
          numeric: true,
        }) * (sortDirection === 'asc' ? 1 : -1)
      })
    }

    return {
      series: {
        type: s.type === 'histogram' ? 'bar' : 'line',
        dimensions: s.aggregate_y ? [xColumn, yColumn] : resourceColumns.map(c => c.name),
        name: yColumn,
        encode: {
          x: xColumn,
          y: yColumn,
        },
      } as LineSeriesOption | BarSeriesOption,
      data: {
        source: sortedData,
        dimensions: s.aggregate_y ? [xColumn, yColumn] : resourceColumns.map(c => c.name),
      },
    }
  })

  const seriesData = {
    series: [] as Array<LineSeriesOption | BarSeriesOption>,
    data: [] as Array<Record<string, unknown>>,
  }

  for (const curr of seriesArray) {
    if (!curr) continue
    seriesData.series.push(curr.series)
    seriesData.data.push(curr.data)
  }

  const xAxisType = mapXAxisType(props.chart.x_axis)

  return {
    dataset: [...seriesData.data],
    textStyle: {
      fontFamily: 'Marianne, arial, sans-serif',
    },
    color: '#000091',
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ value: Record<string, unknown>, axisValueLabel: string, seriesName: string }>) => {
        let tooltip = ''
        const valueFormatter = new Intl.NumberFormat(locale)
        const xAxisFormatter = buildXAxisFormatter(xAxisColumn.value, { dateStyle: 'medium' })
        for (const param of params) {
          const seriesName = param.seriesName
          const axisLabel = xAxisFormatter ? xAxisFormatter(param.axisValueLabel) : param.axisValueLabel
          tooltip += `${format.encodeHTML(String(axisLabel))}: <strong>${valueFormatter.format(Number(param.value[seriesName]))}</strong><br>`
        }
        return tooltip
      },
    },
    legend: {
      show: false,
      bottom: 0,
    },
    grid: {
      top: 60,
      bottom: 40,
      left: 20,
      right: 20,
      containLabel: true,
    },
    xAxis: {
      type: xAxisType,
      name: (props.chart.x_axis as XAxis).column_x,
      min: xAxisType !== 'category' ? xAxisColumn.value?.min ?? xAxisBounds.value.min ?? undefined : undefined,
      max: xAxisType !== 'category' ? xAxisColumn.value?.max ?? xAxisBounds.value.max ?? undefined : undefined,
      axisLabel: xAxisType === 'time'
        ? { formatter: buildXAxisFormatter(xAxisColumn.value) }
        : undefined,
    },
    yAxis: {
      type: 'value' as const,
      name: props.chart.y_axis.label ?? undefined,
      min: props.chart.y_axis.min ?? undefined,
      max: props.chart.y_axis.max ?? undefined,
      axisLabel: {
        formatter: buildYAxisFormatter(props.chart.y_axis),
      },
    },
    series: seriesData.series,
  } satisfies ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
  >
})

onMounted(() => {
  if (chartContainer.value) {
    echartsInstance = init(chartContainer.value)
    updateChart()
  }
})

onUnmounted(() => {
  if (echartsInstance) {
    echartsInstance.dispose()
    echartsInstance = null
  }
})

watch(() => props.chart, updateChart, { deep: true })

watch(() => props.series, updateChart, { deep: true })

function updateChart() {
  if (!echartsInstance) return
  const option = echartsOption.value
  if (option) {
    echartsInstance.setOption(option, { notMerge: true })
  }
}

const handleResize = () => {
  if (echartsInstance) {
    echartsInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
