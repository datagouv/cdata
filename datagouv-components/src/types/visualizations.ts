import type { Owned, OwnedWithId } from './owned'
import type { ColumnType } from '../components/TabularExplorer/types'
import type { TabularAggregateType } from '../functions/tabularApi'

export type FilterCondition = 'exact' | 'differs' | 'is_null' | 'is_not_null' | 'greater' | 'less' | 'strictly_greater' | 'strictly_less'
export type Filter = {
  _cls: 'Filter'
  column: string
  condition: FilterCondition
  value: string | null
}

export type AndFilters = {
  _cls: 'AndFilters'
  filters: Array<Filter | OrFilters>
}

export type OrFilters = {
  _cls: 'OrFilters'
  filters: Array<Filter | AndFilters>
}

export type GenericFilter = Filter | AndFilters | OrFilters

export type UnitPosition = 'prefix' | 'suffix'

export type ChartType = 'line' | 'histogram'

export type YAxis = {
  min: number | null
  max: number | null
  label: string | null
  unit: string | null
  unit_position: UnitPosition | null
}

export type Chart = Owned & {
  id: string
  title: string
  slug: string
  description: string
  private: boolean
  created_at: string
  last_modified: string
  deleted_at: string | null
  image: string | null
  uri: string
  page: string
  query: string
  resource_id: string
  chart_type: ChartType
  y_axis: YAxis
  extras: Record<string, unknown>
  permissions: { delete: boolean, edit: boolean, read: boolean }
  metrics: {
    views: number
  }
}

export type ChartForApi = OwnedWithId & Pick<Chart, 'title' | 'description' | 'private' | 'query' | 'resource_id' | 'chart_type' | 'y_axis' | 'extras'>

export type ChartViewerSeriesType = ChartType

export type ChartViewerSeries = {
  type: ChartViewerSeriesType
  column_y: string
  aggregate_y: TabularAggregateType | null
  resource_id: string
  column_x_name_override: string | null
}

export type ChartViewerXAxis = {
  column_x: string
  sort_x_by: 'axis_x' | 'axis_y' | null
  sort_x_direction: 'asc' | 'desc' | null
  type: 'discrete' | 'continuous'
}

export type ChartViewerConfig = {
  x_axis: ChartViewerXAxis
  y_axis: YAxis
  series: Array<ChartViewerSeries>
}

export type ChartForm = Omit<ChartForApi, 'owner' | 'organization'> & {
  owned: OwnedWithId
}

export type ColumnDefinition = { name: string, type: ColumnType, min?: number, max?: number }
export type ColumnsDefinition = Record<string, Array<ColumnDefinition>>
