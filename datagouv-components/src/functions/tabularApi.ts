import { ofetch } from 'ofetch'
import { useComponentsConfig, type PluginConfig } from '../config'

export type SortConfig = {
  column: string
  type: string
} | null

export type TabularDataResponse = {
  data: Array<Record<string, unknown>>
  meta: { total: number }
}

export type FetchTabularDataOptions = {
  resourceId: string
  page?: number
  pageSize?: number
  sort?: SortConfig
  groupBy?: string
  aggregation?: {
    column: string
    type: 'svg' | 'avg' | 'sum' | 'count' | 'min' | 'max'
  }
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
  if (options.sort) {
    url += `&${options.sort.column}__sort=${options.sort.type}`
  }
  if (options.groupBy) {
    url += `&${options.groupBy}__groupby`
  }
  if (options.aggregation) {
    url += `&${options.aggregation.column}__${options.aggregation.type}`
  }
  return await ofetch<TabularDataResponse>(url)
}

/**
 * Call Tabular-api to get table content
 */
export function getData(config: PluginConfig, id: string, page: number, sortConfig?: SortConfig) {
  return fetchTabularData(config, { resourceId: id, page, sort: sortConfig })
}

/**
 * Call Tabular-api to get table profile
 */
export function useGetProfile() {
  const config = useComponentsConfig()
  return (id: string) => ofetch<TabularProfileResponse>(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
