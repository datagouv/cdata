import type { Owned, OwnedWithId } from './owned'
import type { ColumnType } from '../components/TabularExplorer/types'

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
  y_axis: YAxis
  extras: Record<string, unknown>
  permissions: { delete: boolean, edit: boolean, read: boolean }
  metrics: {
    views: number
  }
}

export type ChartForApi = OwnedWithId & Pick<Chart, 'title' | 'description' | 'private' | 'query' | 'resource_id' | 'y_axis' | 'extras'>

export type ChartForm = Omit<ChartForApi, 'owner' | 'organization'> & {
  owned: OwnedWithId
}

export type ColumnDefinition = { name: string, type: ColumnType, min?: number, max?: number }
export type ColumnsDefinition = Record<string, Array<ColumnDefinition>>
