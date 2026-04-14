import type { TabularAggregateType } from '../functions/tabularApi'
import type { Owned, OwnedWithId } from './owned'

export type FilterCondition = 'exact' | 'differs' | 'is_null' | 'is_not_null' | 'greater' | 'less' | 'strictly_greater' | 'strictly_less'
export type Filter = {
  column: string
  condition: FilterCondition
  value: string | null
}

export type AndFilters = {
  filters: Array<Filter | AndFilters>
}

export type GenericFilter = Filter | AndFilters

export type XAxisType = 'discrete' | 'continuous'

export type XAxisSortBy = 'axis_x' | 'axis_y'

export type SortDirection = 'asc' | 'desc'

export type XAxis = {
  column_x: string
  sort_x_by: XAxisSortBy | null
  sort_x_direction: SortDirection | null
  type: XAxisType
}

export type CombinedSort = '' | 'axis_x-asc' | 'axis_x-desc' | 'axis_y-asc' | 'axis_y-desc'

export type XAxisForm = Omit<XAxis, 'sort_x_by' | 'sort_x_direction'> & { sort_combined: CombinedSort }

export type UnitPosition = 'prefix' | 'suffix'

export type YAxis = {
  min: number | null
  max: number | null
  label: string | null
  unit: string | null
  unit_position: UnitPosition | null
}

export type DataSeriesType = 'line' | 'histogram'

export type DataSeries = {
  type: DataSeriesType
  column_y: string
  aggregate_y: TabularAggregateType | null
  resource_id: string
  column_x_name_override: string | null
  filters: GenericFilter | null
}

// Type for form where aggregate_y can be empty string for select binding
export type DataSeriesForm = Omit<DataSeries, 'aggregate_y'> & { aggregate_y: TabularAggregateType | '' | null }

export type Chart = Owned & {
  id: string
  title: string
  slug: string
  description: string
  private: boolean
  created_at: string
  last_modified: string
  deleted_at: string | null
  uri: string
  page: string
  x_axis: XAxis
  y_axis: YAxis
  series: Array<DataSeries>
  extras: Record<string, unknown>
  permissions: { delete: boolean, edit: boolean, read: boolean }
  metrics: {
    views: number
  }
}

export type ChartForApi = OwnedWithId & Pick<Chart, 'title' | 'description' | 'private' | 'x_axis' | 'y_axis' | 'series' | 'extras'>

export type ChartForm = Omit<ChartForApi, 'x_axis' | 'series' | 'owner' | 'organization'> & {
  owned: OwnedWithId
  x_axis: XAxisForm
  series: Array<DataSeriesForm>
  chart_type?: DataSeriesType | null
  filter: GenericFilter | null
}
