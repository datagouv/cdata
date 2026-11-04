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
import type { ChartViewerConfig, ChartViewerXAxis, ColumnDefinition, ColumnsDefinition, YAxis } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: ChartViewerConfig
  series: {
    data: Record<string, Array<Record<string, unknown>>>
    columns: ColumnsDefinition
  }
}>()

const { locale } = useTranslation()
const { formatDate } = useFormatDate()
const chartContainer = ref<HTMLElement | null>(null)
let echartsInstance: EChartsType | null = null

// DSFR chart colors, cycled by ECharts (one color per Y series). Keep the
// first color at #000091: charts saved before this palette existed rendered
// in this blue.
const CHART_COLORS = ['#000091', '#82B5F2', '#29598F', '#31A7AE', '#81EEF5', '#B478F1', '#CFB1F5', '#CECECE']

// Dense line series turn into a solid bead of markers: keep at most this many
// evenly spaced ones (size 0 hides the rest; the axis tooltip still covers
// every point). Each series starts at its own offset within the step so
// overlapping series do not stack their markers on the same x positions.
const MAX_LINE_SYMBOLS = 12
const LINE_SYMBOL_SIZE = 8

function lineSymbolSize(pointCount: number, seriesIndex: number, seriesCount: number) {
  const step = Math.max(1, Math.ceil(pointCount / MAX_LINE_SYMBOLS))
  const offset = Math.floor((seriesIndex * step) / seriesCount)
  return (_value: unknown, params: { dataIndex: number }) =>
    params.dataIndex % step === offset ? LINE_SYMBOL_SIZE : 0
}

function capture(): string | null {
  return echartsInstance?.getDataURL() ?? null
}

defineExpose({ capture })

// ECharts has a dedicated 'time' axis type for continuous date values.
function mapXAxisType(xAxis: ChartViewerXAxis): 'category' | 'value' | 'time' {
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

  const seriesArray = props.chart.series.map((s, seriesIndex) => {
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

    const lineOptions = s.type === 'histogram'
      ? {}
      // showAllSymbol: ECharts' own 'auto' thinning (category axes) would
      // fight the evenly spaced selection.
      : {
          smooth: true,
          showAllSymbol: true,
          symbolSize: lineSymbolSize(sortedData.length, seriesIndex, seriesCount),
        }

    return {
      series: {
        type: s.type === 'histogram' ? 'bar' : 'line',
        ...lineOptions,
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
    color: CHART_COLORS,
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ value: Record<string, unknown>, axisValueLabel: string, seriesName: string }>) => {
        const valueFormatter = new Intl.NumberFormat(locale)
        const xAxisFormatter = buildXAxisFormatter(xAxisColumn.value, { dateStyle: 'medium' })
        const first = params[0]
        if (!first) return ''
        const axisLabel = xAxisFormatter ? xAxisFormatter(first.axisValueLabel) : first.axisValueLabel
        let tooltip = `<strong>${format.encodeHTML(String(axisLabel))}</strong><br>`
        for (const param of params) {
          tooltip += `${format.encodeHTML(param.seriesName)}: <strong>${valueFormatter.format(Number(param.value[param.seriesName]))}</strong><br>`
        }
        return tooltip
      },
    },
    legend: {
      show: seriesCount > 1,
      bottom: 0,
    },
    grid: {
      top: 60,
      // Labels + nameLocation 'middle' name; more room for the legend row when
      // several series are shown.
      bottom: seriesCount > 1 ? 80 : 60,
      left: 20,
      right: 20,
      containLabel: true,
    },
    xAxis: {
      type: xAxisType,
      name: props.chart.x_axis.column_x,
      // 'end' (the default) renders the name past the grid edge, where it gets
      // clipped by the canvas; 'middle' centers it under the axis.
      nameLocation: 'middle' as const,
      // Clears the rotated axis labels between the axis line and the name.
      nameGap: 30,
      min: xAxisType !== 'category' ? xAxisColumn.value?.min ?? xAxisBounds.value.min ?? undefined : undefined,
      max: xAxisType !== 'category' ? xAxisColumn.value?.max ?? xAxisBounds.value.max ?? undefined : undefined,
      // 'auto' + hideOverlap: ECharts skips category labels that don't fit
      // instead of overlapping them; merged with the time-axis formatter.
      axisLabel: {
        interval: xAxisType === 'category' ? 'auto' as const : undefined,
        hideOverlap: true,
        ...(xAxisType === 'time' ? { formatter: buildXAxisFormatter(xAxisColumn.value) } : {}),
      },
    },
    yAxis: {
      type: 'value' as const,
      name: props.chart.y_axis.label ?? undefined,
      min: props.chart.y_axis.min ?? undefined,
      max: props.chart.y_axis.max ?? undefined,
      axisLabel: {
        hideOverlap: true,
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
