<template>
  <VChart
    class="w-full min-h-96"
    :option="echartsOption"
    autoresize
  />
</template>

<script setup lang="ts">
import { format, use, type ComposeOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, type BarSeriesOption, type LineSeriesOption } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { summarize } from '../../functions/helpers'
import type { Chart, DataSeries, XAxis, YAxis, ChartForm, XAxisForm } from '../../types/visualizations'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart | ChartForm
  series: {
    data: Record<string, Array<Record<string, unknown>>>
    columns: Record<string, Array<string>>
  }
}>()

function mapSeriesType(type: DataSeries['type']): 'line' | 'bar' {
  return (type ?? 'line') === 'histogram' ? 'bar' : 'line'
}

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

  // Create series configuration with data mapping
  const seriesData = props.chart.series.map((s) => {
    const xColumn = s.column_x_name_override ?? props.chart.x_axis.column_x
    const yColumn = s.aggregate_y ? `${s.column_y}__${s.aggregate_y}` : s.column_y
    const resourceId = s.resource_id
    const seriesType = s.type

    if (!xColumn || !yColumn || !resourceId || !seriesType || !props.series.data[resourceId] || !props.series.columns[resourceId]) {
      return null
    }

    // Sort data before passing to ECharts to avoid transform issues
    const sortedData = [...props.series.data[resourceId]]
    const sortBy = props.chart.x_axis.sort_x_by
    const sortDirection = props.chart.x_axis.sort_x_direction ?? 'asc'

    if (sortBy && sortDirection && props.chart.x_axis.column_x) {
      const sortKey = sortBy === 'axis_x' ? xColumn : yColumn
      sortedData.sort((a, b) => {
        const valA = a[sortKey] as number
        const valB = b[sortKey] as number
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return {
      series: {
        type: mapSeriesType(seriesType),
        dimensions: s.aggregate_y ? [xColumn, yColumn] : props.series.columns[resourceId],
        name: s.column_y,
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
  }).filter(Boolean).reduce((acc: { series: Array<LineSeriesOption | BarSeriesOption>, data: Array<Record<string, unknown>> }, curr) => {
    if (curr) {
      acc.series.push(curr.series)
      acc.data.push(curr.data)
    }
    return acc
  }, {
    series: [],
    data: [],
  })

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
        for (const param of params) {
          const keys = Object.keys(param.value)
          const col = keys.find(key => key.startsWith(param.seriesName))!
          const formatter = new Intl.NumberFormat('fr-FR')
          tooltip += `${format.encodeHTML(param.axisValueLabel)}: <strong>${formatter.format(Number(param.value[col]))}</strong><br>`
        }
        return tooltip
      },
    },
    legend: {
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
</script>
