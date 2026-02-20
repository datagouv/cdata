import type { Owned, OwnedWithId } from './owned'

// Filter types
export type FilterCondition = 'equal' | 'greater'

export type Filter = {
  column: string
  condition: FilterCondition
  value?: string
}

export type AndFilters = {
  filters: Array<Filter | AndFilters>
}

export type GenericFilter = Filter | AndFilters

// Axis types
export type XAxisType = 'discrete' | 'continuous'

export type XAxisSortBy = 'axis_x' | 'axis_y'

export type SortDirection = 'asc' | 'desc'

export type XAxis = {
  column_x: string
  sort_x_by?: XAxisSortBy
  sort_x_direction?: SortDirection
  type: XAxisType
}

export type UnitPosition = 'prefix' | 'suffix'

export type YAxis = {
  min?: number
  max?: number
  label?: string
  unit?: string
  unit_position?: UnitPosition
}

// Data series types
export type DataSeriesType = 'line' | 'histogram'

export type AggregateType = 'sum' | 'median'

export type DataSeries = {
  type: DataSeriesType
  column_y?: string
  aggregate_y?: AggregateType
  resource_id?: string
  column_x_name_override?: string
  filters?: GenericFilter
}

// Chart form fields (for POST/PATCH requests)
export type ChartForm = OwnedWithId & {
  title: string
  description: string
  private?: boolean
  x_axis?: XAxis
  y_axis?: YAxis
  series?: Array<DataSeries>
  extras?: Record<string, unknown>
}

// Chart read fields (API responses)
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
  x_axis?: XAxis
  y_axis?: YAxis
  series?: Array<DataSeries>
  extras: Record<string, unknown>
  permissions: { delete: boolean, edit: boolean, read: boolean }
  metrics: {
    views: number
  }
}
