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
import { formatYAxisValue, seriesLabel } from '../../functions/charts'
import { CHART_PAGE_SIZE } from '../../functions/chartData'
import { useFormatDate } from '../../functions/dates'
import type { Chart, ColumnDefinition, ColumnsDefinition, XAxis, XAxisForm, ChartForApi } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart | ChartForApi
  series: {
    /** Rows of each series, keyed by the series index. */
    data: Record<string, Array<Record<string, unknown>>>
    /** Columns of each resource, keyed by resource id. */
    columns: ColumnsDefinition
  }
}>()

const { locale, t } = useTranslation()
const { formatDate } = useFormatDate()
const chartContainer = ref<HTMLElement | null>(null)
let echartsInstance: EChartsType | null = null

// One color per series, cycled by ECharts.
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
function mapXAxisType(xAxis: XAxis | XAxisForm): 'category' | 'value' | 'time' {
  if (!xAxis) return 'category'
  if (xAxis.type !== 'continuous') return 'category'
  return isDateAxis.value ? 'time' : 'value'
}

function allYValuesAreIntegers(plotted: Array<PlottedSeries>): boolean {
  return plotted.every(({ yColumn, rows }) => rows.every((row) => {
    const value = row[yColumn]
    return value === null || value === undefined || Number.isInteger(Number(value))
  }))
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

// Years (whole numbers from 1000 to 2999) read without a thousands separator:
// "2018", not "2 018" nor ECharts' default "2,018".
function buildXNumberFormatter(plotted: Array<PlottedSeries>): (value: number) => string {
  const values = plotted.flatMap(p => p.rows.map(row => row[p.xColumn]))
  const years = values.length > 0 && values.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 1000 && v <= 2999)
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 10, useGrouping: !years })
  return (value: number) => formatter.format(value)
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

type PlottedSeries = { xColumn: string, yColumn: string, rows: Array<Record<string, unknown>> }

function xAxisBounds(plotted: Array<PlottedSeries>): { min: number | undefined, max: number | undefined } {
  let min: number | undefined
  let max: number | undefined
  for (const { xColumn, rows } of plotted) {
    for (const row of rows) {
      const value = row[xColumn]
      if (value === null || value === undefined) continue
      const numericValue = value instanceof Date
        ? value.getTime()
        : isDateAxis.value && typeof value === 'string' ? new Date(value).getTime() : Number(value)
      if (Number.isNaN(numericValue)) continue
      if (min === undefined || numericValue < min) min = numericValue
      if (max === undefined || numericValue > max) max = numericValue
    }
  }
  return { min, max }
}

const echartsOption = computed(() => {
  const seriesCount = props.chart.series.length
  if (!props.chart.series || seriesCount === 0) return

  let referenceXs: Array<unknown> | null = null
  const xKey = (x: unknown) => x instanceof Date ? x.getTime() : String(x)
  // The profile bounds span the whole column: once values are left out, they
  // would stretch the axis over values that are not drawn.
  let valuesLeftOut = false

  const xAxisType = mapXAxisType(props.chart.x_axis)
  const isTimeAxis = xAxisType === 'time'

  const seriesArray = props.chart.series.map((s, seriesIndex) => {
    const xColumn = s.column_x_name_override ?? props.chart.x_axis.column_x
    const yColumn = s.aggregate_y ? `${s.column_y}__${s.aggregate_y}` : s.column_y
    const resourceId = s.resource_id

    const resourceColumns = props.series.columns[resourceId]
    const rawData = props.series.data[String(seriesIndex)]
    if (!xColumn || !yColumn || !resourceId || !s.type || !rawData || !resourceColumns) {
      return null
    }

    // Only a time axis needs Date values: on a category axis each Date object
    // would be a distinct category, so the series would not share their X values.
    const sortedData = isTimeAxis
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

    // The first series decides the X order and, with a limit, the kept X
    // values. When sorting by Y each series would otherwise rank X on its own
    // column: the other series are reordered and cut to the first series' X
    // values (a missing X gives an empty point) so they stay aligned.
    const limit = props.chart.x_axis.limit
    if (rawData.length >= CHART_PAGE_SIZE || (limit != null && limit < sortedData.length)) valuesLeftOut = true
    let limitedData: Array<Record<string, unknown>>
    if (!referenceXs) {
      limitedData = limit != null && limit < sortedData.length
        ? sortedData.slice(0, limit)
        : sortedData
      referenceXs = limitedData.map(row => row[xColumn])
    }
    else if (sortBy === 'axis_y') {
      const byX = new Map(sortedData.map(row => [xKey(row[xColumn]), row]))
      limitedData = referenceXs.map(x => byX.get(xKey(x)) ?? { [xColumn]: x })
    }
    else {
      limitedData = limit != null && limit < sortedData.length
        ? sortedData.slice(0, limit)
        : sortedData
    }

    const lineOptions = s.type === 'histogram'
      ? {}
      // showAllSymbol: ECharts' own 'auto' thinning (category axes) would
      // fight the evenly spaced selection.
      : {
          smooth: true,
          showAllSymbol: true,
          symbolSize: lineSymbolSize(limitedData.length, seriesIndex, seriesCount),
        }

    return {
      xColumn,
      yColumn,
      label: seriesLabel(s, t),
      series: {
        type: s.type === 'histogram' ? 'bar' : 'line',
        ...lineOptions,
        dimensions: s.aggregate_y ? [xColumn, yColumn] : resourceColumns.map(c => c.name),
        encode: {
          x: xColumn,
          y: yColumn,
        },
      } as LineSeriesOption | BarSeriesOption,
      data: {
        source: limitedData,
        dimensions: s.aggregate_y ? [xColumn, yColumn] : resourceColumns.map(c => c.name),
      },
    }
  })

  const seriesData = {
    series: [] as Array<LineSeriesOption | BarSeriesOption>,
    data: [] as Array<Record<string, unknown>>,
  }
  const plotted: Array<PlottedSeries> = []
  const labelCounts = new Map<string, number>()

  for (const curr of seriesArray) {
    if (!curr) continue
    // ECharts merges the legend entries of series sharing a name.
    const count = (labelCounts.get(curr.label) ?? 0) + 1
    labelCounts.set(curr.label, count)
    seriesData.series.push({ ...curr.series, name: count > 1 ? `${curr.label} (${count})` : curr.label, datasetIndex: seriesData.data.length })
    seriesData.data.push(curr.data)
    plotted.push({ xColumn: curr.xColumn, yColumn: curr.yColumn, rows: curr.data.source })
  }

  const shownBounds = xAxisBounds(plotted)
  const xNumberFormatter = buildXNumberFormatter(plotted)
  const xMin = valuesLeftOut ? shownBounds.min : xAxisColumn.value?.min ?? shownBounds.min
  const xMax = valuesLeftOut ? shownBounds.max : xAxisColumn.value?.max ?? shownBounds.max

  return {
    dataset: [...seriesData.data],
    textStyle: {
      fontFamily: 'Marianne, arial, sans-serif',
    },
    color: CHART_COLORS,
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ value: Record<string, unknown>, axisValueLabel: string, seriesName: string, seriesIndex: number }>) => {
        const valueFormatter = new Intl.NumberFormat(locale)
        const xAxisFormatter = buildXAxisFormatter(xAxisColumn.value, { dateStyle: 'medium' })
        const first = params[0]
        if (!first) return ''
        const axisLabel = xAxisFormatter ? xAxisFormatter(first.axisValueLabel) : first.axisValueLabel
        let tooltip = `<strong>${format.encodeHTML(String(axisLabel))}</strong><br>`
        for (const param of params) {
          const yColumn = plotted[param.seriesIndex]?.yColumn
          const value = yColumn === undefined ? undefined : param.value[yColumn]
          const formatted = value === null || value === undefined ? '–' : valueFormatter.format(Number(value))
          tooltip += `${format.encodeHTML(param.seriesName)}: <strong>${formatted}</strong><br>`
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
      name: (props.chart.x_axis as XAxis).column_x,
      // 'end' (the default) renders the name past the grid edge, where it gets
      // clipped by the canvas; 'middle' centers it under the axis.
      nameLocation: 'middle' as const,
      // Clears the axis labels between the axis line and the name.
      nameGap: 30,
      min: xAxisType !== 'category' ? xMin : undefined,
      max: xAxisType !== 'category' ? xMax : undefined,
      // 'auto' + hideOverlap: ECharts skips labels that don't fit instead of
      // overlapping them; merged with the date formatter.
      axisLabel: {
        interval: xAxisType === 'category' ? 'auto' as const : undefined,
        hideOverlap: true,
        ...(isDateAxis.value ? { formatter: buildXAxisFormatter(xAxisColumn.value) } : {}),
        ...(xAxisType === 'value' ? { formatter: xNumberFormatter } : {}),
      },
    },
    yAxis: {
      type: 'value' as const,
      name: props.chart.y_axis.label ?? undefined,
      min: props.chart.y_axis.min ?? undefined,
      max: props.chart.y_axis.max ?? undefined,
      // Integer data (counts…) must not get fractional ticks like 0,2 or 0,4.
      minInterval: allYValuesAreIntegers(plotted) ? 1 : undefined,
      axisLabel: {
        hideOverlap: true,
        formatter: (value: number) => formatYAxisValue(value, locale, props.chart.y_axis),
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
