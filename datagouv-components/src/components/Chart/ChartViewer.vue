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
import type { Chart, XAxis, YAxis, XAxisForm, ChartForApi } from '../../types/visualizations'
import { useTranslation } from '../../composables/useTranslation'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart | ChartForApi
  series: {
    data: Record<string, Array<Record<string, unknown>>>
    columns: Record<string, Array<string>>
  }
}>()

const { locale } = useTranslation()
const chartContainer = ref<HTMLElement | null>(null)
let echartsInstance: EChartsType | null = null

function mapXAxisType(xAxis: XAxis | XAxisForm): 'category' | 'value' {
  if (!xAxis) return 'category'
  return (xAxis.type ?? 'discrete') === 'continuous' ? 'value' : 'category'
}

function buildYAxisFormatter(yAxis: YAxis): ((value: number) => string) | undefined {
  return (value: number) => {
    const v = summarize(value)
    if (!yAxis.unit) return v
    if (yAxis.unit_position === 'prefix') return `${yAxis.unit} ${v}`
    return `${v} ${yAxis.unit}`
  }
}

const echartsOption = computed(() => {
  const seriesCount = props.chart.series.length
  if (!props.chart.series || seriesCount === 0) return

  const seriesArray = props.chart.series.map((s) => {
    const xColumn = s.column_x_name_override ?? props.chart.x_axis.column_x
    const yColumn = s.aggregate_y ? `${s.column_y}__${s.aggregate_y}` : s.column_y
    const resourceId = s.resource_id

    if (!xColumn || !yColumn || !resourceId || !s.type || !props.series.data[resourceId] || !props.series.columns[resourceId]) {
      return null
    }

    const sortedData = [...props.series.data[resourceId]]
    const sortBy = props.chart.x_axis.sort_x_by
    const sortDirection = props.chart.x_axis.sort_x_direction ?? 'asc'

    if (sortBy && sortDirection && props.chart.x_axis.column_x) {
      const sortKey = sortBy === 'axis_x' ? xColumn : yColumn
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
        dimensions: s.aggregate_y ? [xColumn, yColumn] : props.series.columns[resourceId],
        name: yColumn,
        encode: {
          x: xColumn,
          y: yColumn,
        },
      } as LineSeriesOption | BarSeriesOption,
      data: {
        source: sortedData,
        dimensions: s.aggregate_y ? [xColumn, yColumn] : props.series.columns[resourceId],
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

  return {
    dataset: [...seriesData.data],
    title: {
      text: props.chart.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ value: Record<string, unknown>, axisValueLabel: string, seriesName: string }>) => {
        let tooltip = ''
        const formatter = new Intl.NumberFormat('fr-FR')
        for (const param of params) {
          const seriesName = param.seriesName
          tooltip += `${format.encodeHTML(param.axisValueLabel)}: <strong>${formatter.format(Number(param.value[seriesName]))}</strong><br>`
        }
        return tooltip
      },
    },
    legend: {
      show: seriesData.series.length > 1,
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
      type: mapXAxisType(props.chart.x_axis),
      name: (props.chart.x_axis as XAxis).column_x,
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
