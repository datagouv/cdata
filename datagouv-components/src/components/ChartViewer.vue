<template>
  <VChart
    class="chart-viewer"
    :option="echartsOption"
    autoresize
  />
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import type { Chart, DataSeries, XAxis, YAxis } from '../types/visualizations'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart
}>()

const DUMMY_SOURCE = [
  ['category', 'Série 1', 'Série 2'],
  ['Jan', 120, 80],
  ['Fév', 132, 95],
  ['Mar', 101, 110],
  ['Avr', 134, 87],
  ['Mai', 90, 125],
  ['Juin', 230, 145],
  ['Juil', 210, 160],
  ['Août', 182, 130],
  ['Sep', 191, 140],
  ['Oct', 234, 155],
  ['Nov', 260, 170],
  ['Déc', 300, 190],
]

function mapSeriesType(type: DataSeries['type']): 'line' | 'bar' {
  return type === 'histogram' ? 'bar' : 'line'
}

function mapXAxisType(xAxis?: XAxis): 'category' | 'value' {
  if (!xAxis) return 'category'
  return xAxis.type === 'continuous' ? 'value' : 'category'
}

function buildYAxisFormatter(yAxis?: YAxis): ((value: number) => string) | undefined {
  if (!yAxis?.unit) return undefined
  return (value: number) => {
    if (yAxis.unit_position === 'prefix') return `${yAxis.unit}${value}`
    return `${value}${yAxis.unit}`
  }
}

const echartsOption = computed(() => {
  const series = (props.chart.series ?? []).map((s, i) => ({
    type: mapSeriesType(s.type),
    name: s.column_x_name_override ?? `Série ${i + 1}`,
    encode: {
      x: 'category',
      y: s.column_y ?? DUMMY_SOURCE[0]![i + 1],
    },
  }))

  // Default to a single line series if none defined
  if (series.length === 0) {
    series.push({ type: 'line', name: 'Série 1', encode: { x: 'category', y: 'Série 1' } })
  }

  return {
    dataset: { source: DUMMY_SOURCE },
    title: {
      text: props.chart.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      bottom: 0,
    },
    grid: {
      top: 60,
      bottom: 40,
      left: 60,
      right: 20,
      containLabel: true,
    },
    xAxis: {
      type: mapXAxisType(props.chart.x_axis),
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
  }
})
</script>

<style scoped>
.chart-viewer {
  width: 100%;
  min-height: 400px;
}
</style>
