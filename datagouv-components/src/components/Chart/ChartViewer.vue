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
import { computed, watchEffect } from 'vue'
import { summarize } from '../../functions/helpers'
import type { Chart, DataSeries, XAxis, YAxis, ChartForm } from '../../types/visualizations'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart | ChartForm
  series: {
    data: Record<string, Array<Record<string, unknown>>>
    columns: Record<string, Array<string>>
  }
}>()

function mapSeriesType(type: DataSeries['type']): 'line' | 'bar' {
  return type === 'histogram' ? 'bar' : 'line'
}

function mapXAxisType(xAxis?: XAxis): 'category' | 'value' {
  if (!xAxis) return 'category'
  return xAxis.type === 'continuous' ? 'value' : 'category'
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
  const { data, series } = props.chart.series.map((s) => {
    const xColumn = s.column_x_name_override ?? props.chart.x_axis.column_x
    const yColumn = s.aggregate_y ? `${s.column_y}__${s.aggregate_y}` : s.column_y
    // const sortColumn = xColumn && props.chart.x_axis.sort_x_by && (props.chart.x_axis.sort_x_by === 'axis_x' || yColumn) ? {
    // 'axis_x': xColumn,
    // 'axis_y': yColumn
    // }[props.chart.x_axis.sort_x_by] : undefined
    return {
      series: {
        type: mapSeriesType(s.type),
        dimensions: s.aggregate_y ? [xColumn, yColumn] : props.series.columns[s.resource_id],
        name: s.column_y,
        encode: {
          x: xColumn,
          y: yColumn,
        },
        // datasetIndex: props.chart.x_axis.sort_x_by ? seriesCount + i : i,
      },
      data: {
        source: props.series.data[s.resource_id],
        // dimensions: s.aggregate_y ? [xColumn, yColumn] : props.series.columns[s.resource_id],
        // transform: sortColumn ? {
        //  type: 'sort',
        //  config: { dimension: xColumn, order: props.chart.x_axis.sort_x_direction }
        // } : {},
      },
    }
  }).reduce((acc, curr) => {
    acc.series.push(curr.series)
    acc.data.push(curr.data)
    return acc
  }, {
    series: [],
    data: [],
  })
  return {
    dataset: data,
    title: {
      text: props.chart.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let tooltip = ''
        for (const param of params) {
          const keys = Object.keys(param.value)
          const col = keys.find(key => key.startsWith(param.seriesName))!
          const formatter = new Intl.NumberFormat('fr-FR')
          tooltip += `${format.encodeHTML(param.axisValueLabel)}: <strong>${formatter.format(param.value[col])}</strong><br>`
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
      name: props.chart.x_axis?.column_x,
    },
    yAxis: {
      type: 'value',
      name: props.chart.y_axis?.label,
      min: props.chart.y_axis?.min ?? undefined,
      max: props.chart.y_axis?.max ?? undefined,
      axisLabel: {
        formatter: buildYAxisFormatter(props.chart.y_axis),
      },
    },
    series,
  } satisfies ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
  >
})
watchEffect(() => {
  console.log(echartsOption.value)
})
</script>
