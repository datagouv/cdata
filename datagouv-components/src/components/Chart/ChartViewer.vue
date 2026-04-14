<template>
  <VChart
    class="w-full min-h-96"
    :option="echartsOption"
    autoresize
  />
</template>

<script setup lang="ts">
import { use, type ComposeOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, type BarSeriesOption, type LineSeriesOption } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { summarize } from '../../functions/helpers'
import { throwOnNever } from '../../functions/never'
import type { Chart, DataSeries, XAxis, YAxis, AggregateType } from '../../types/visualizations'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DatasetComponent])

const props = defineProps<{
  chart: Chart
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

function buildYAxisFormatter(yAxis?: YAxis): ((value: number) => string) | undefined {
  if (!yAxis?.unit) return undefined
  return (value: number) => {
    const v = summarize(value)
    if (yAxis.unit_position === 'prefix') return `${yAxis.unit} ${v}`
    return `${v} ${yAxis.unit}`
  }
}

/**
 * Aggregates data based on the specified aggregate type
 */
function aggregateData(data: Array<Record<string, unknown>>, yColumn: string, aggregateType: AggregateType): number | null {
  const values: number[] = []

  for (const row of data) {
    const value = row[yColumn]
    if (typeof value === 'number') {
      values.push(value)
    }
  }

  if (values.length === 0) return null

  switch (aggregateType) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0)
    case 'median': {
      // Calculate median
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      if (sorted.length % 2 === 0) {
        const median = (sorted[mid - 1]! + sorted[mid]!) / 2
        return isNaN(median) ? null : median
      }
      else {
        return sorted[mid]!
      }
    }
    // case 'average':
    //   const sum = values.reduce((sum, val) => sum + val, 0)
    //   const average = sum / values.length
    //   return isNaN(average) ? null : average
    // case 'count':
    //   return values.length
    // case 'count_distinct':
    //   // Count distinct values
    //   const distinctValues = new Set(values)
    //   return distinctValues.size
    //  }
    default:
      return throwOnNever(aggregateType, 'Aggregate type unknown')
  }
}

/**
 * Transforms the dataset by applying aggregation based on aggregate_y
 */
function transformDatasetWithAggregation(
  data: Record<string, Array<Record<string, unknown>>>,
  seriesConfig: DataSeries[],
  xColumn: string,
) {
  const transformedData: Array<Record<string, unknown>> = []

  for (const [resourceId, resourceData] of Object.entries(data)) {
    const resourceConfig = seriesConfig.find(s => s.resource_id === resourceId)
    if (!resourceConfig) continue

    const xLocal = resourceConfig.column_x_name_override ?? xColumn

    // Group data by x-axis column
    const groupedData: Record<string, Array<Record<string, unknown>>> = {}
    for (const item of resourceData) {
      const xValue = item[xLocal]?.toString() ?? 'unknown'
      if (!groupedData[xValue]) {
        groupedData[xValue] = []
      }
      groupedData[xValue].push(item)
    }

    for (const [xValue, group] of Object.entries(groupedData)) {
      const aggregatedY = aggregateData(group, resourceConfig.column_y, resourceConfig.aggregate_y)
      if (aggregatedY !== null) {
        const existingRow = transformedData.find(row => row[xColumn] === xValue)
        if (existingRow) {
          existingRow[resourceConfig.column_y] = aggregatedY
        }
        else {
          transformedData.push({
            [xColumn]: xValue,
            [resourceConfig.column_y]: aggregatedY,
          })
        }
      }
    }
  }
  return transformedData
}

const echartsOption = computed(() => {
  if (!props.chart.series || props.chart.series.length === 0) return

  // Apply data transformation with aggregation
  // Better done in the API for large files
  const transformedData = transformDatasetWithAggregation(
    props.series.data,
    props.chart.series,
    props.chart.x_axis.column_x,
  )

  // Create series configuration with data mapping
  const series = (props.chart.series).map((s) => {
    return {
      type: mapSeriesType(s.type),
      dimensions: props.series.columns[s.resource_id],
      name: s.column_y,
      encode: {
        x: s.column_x_name_override ?? props.chart.x_axis.column_x,
        y: s.column_y,
      },
    }
  })

  console.log(transformedData)

  return {
    dataset: {
      source: transformedData,
    },
    title: {
      text: props.chart.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: props.chart.series.length > 1
      ? {
          bottom: 0,
        }
      : undefined,
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
</script>
