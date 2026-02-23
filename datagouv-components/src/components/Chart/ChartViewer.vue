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
import type { Chart, DataSeries, XAxis, YAxis } from '../../types/visualizations'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart
  seriesData: Record<string, Array<Array<unknown>>>
}>()

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
  if (!props.chart.series || props.chart.series.length === 0) return

  // Create series configuration with data mapping
  const series = (props.chart.series).map((s) => {
    return {
      type: mapSeriesType(s.type),
      name: s.column_x_name_override ?? props.chart.x_axis.column_x,
      encode: {
        x: 'category',
        y: s.column_y,
      },
    }
  })

  // Use the first dataset as the primary source if available
  const primarySource = Object.values(props.seriesData ?? {})[0]

  return {
    dataset: {
      source: primarySource,
    },
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
