import { ofetch } from 'ofetch'
import { useComponentsConfig, type PluginConfig } from '../config'
import type { GenericFilter } from '../types/visualizations'
import type { SortConfig } from '../components/TabularExplorer/types'

export type { SortConfig }

export type TabularDataResponse = {
  data: Array<Record<string, unknown>>
  links: {
    profile: string
    swagger: string
    next: string
  }
  meta: { total: number }
}

export type TabularAggregateType = 'avg' | 'sum' | 'count' | 'min' | 'max'

export type FetchTabularDataOptions = {
  resourceId: string
  page?: number
  pageSize?: number
  columns?: Array<string> | undefined
  sort?: SortConfig
  groupBy?: string | undefined
  aggregation?: {
    column: string
    type: TabularAggregateType
  } | undefined
  filters?: GenericFilter | undefined
}

export type TabularProfileResponse = {
  profile: {
    header: Array<string>
    columns: Record<string, {
      score: number
      format: string
      python_type: string
    }>
    formats: Record<string, Array<string>>
    profile: Record<string, {
      tops: Array<{ count: number, value: string }>
      nb_distinct: number
      nb_missing_values: number
      min?: number
      max?: number
      std?: number
      mean?: number
    }>
    encoding: string
    separator: string
    categorical: Array<string>
    total_lines: number
    nb_duplicates: number
    columns_fields: Record<string, {
      score: number
      format: string
      python_type: string
    }>
    columns_labels: Record<string, {
      score: number
      format: string
      python_type: string
    }>
    header_row_idx: number
    heading_columns: number
    trailing_columns: number
  }
  deleted_at: string | null
  dataset_id: string
  indexes: null
}

/**
 * Call Tabular-api to get table content with options object
 */
export async function fetchTabularData(config: PluginConfig, options: FetchTabularDataOptions): Promise<TabularDataResponse> {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? config.tabularApiPageSize ?? 15
  let url = `${config.tabularApiUrl}/api/resources/${options.resourceId}/data/?page=${page}&page_size=${pageSize}`
  if (options.columns) {
    url += `&columns=${options.columns.map(col => encodeURIComponent(col)).join(',')}`
  }
  if (options.sort) {
    url += `&${encodeURIComponent(options.sort.column)}__sort=${encodeURIComponent(options.sort.direction)}`
  }
  if (options.groupBy && options.aggregation?.type) {
    url += `&${encodeURIComponent(options.groupBy)}__groupby&${encodeURIComponent(options.aggregation.column)}__${encodeURIComponent(options.aggregation.type)}`
  }
  if (options.filters) {
    const filterQuery = buildFilterQuery(options.filters)
    if (filterQuery) {
      url += `&${filterQuery}`
    }
  }
  return await ofetch<TabularDataResponse>(url)
}

function buildFilterQuery(filters: GenericFilter): string {
  const params: Array<string> = []
  if ('filters' in filters) {
    for (const filter of filters.filters) {
      if ('filters' in filter) {
        params.push(buildFilterQuery(filter))
      }
      else {
        if (filter.condition === 'is_null') {
          params.push(`${encodeURIComponent(filter.column)}__isnull`)
        }
        else if (filter.condition === 'is_not_null') {
          params.push(`${encodeURIComponent(filter.column)}__isnotnull`)
        }
        else if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
          params.push(`${encodeURIComponent(filter.column)}__${encodeURIComponent(filter.condition)}=${encodeURIComponent(filter.value)}`)
        }
      }
    }
  }
  else {
    const filter = filters
    if (filter.condition === 'is_null') {
      params.push(`${encodeURIComponent(filter.column)}__isnull`)
    }
    else if (filter.condition === 'is_not_null') {
      params.push(`${encodeURIComponent(filter.column)}__isnotnull`)
    }
    else if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
      params.push(`${encodeURIComponent(filter.column)}__${encodeURIComponent(filter.condition)}=${encodeURIComponent(filter.value)}`)
    }
  }
  return params.join('&')
}

/**
 * Call Tabular-api to get table content
 */
export async function getData(config: PluginConfig, id: string, page: number, sortConfig?: SortConfig | null): Promise<TabularDataResponse> {
  return fetchTabularData(config, {
    resourceId: id,
    page,
    sort: sortConfig ?? undefined,
  })
}

/**
 * Call Tabular-api to get table profile
 */
export function useGetProfile() {
  const config = useComponentsConfig()
  return (id: string) => ofetch<TabularProfileResponse>(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
