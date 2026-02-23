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
}

/**
 * Call Tabular-api to get table content with options object
 */
export async function fetchTabularData(config: PluginConfig, options: FetchTabularDataOptions): Promise<TabularDataResponse> {
  const resourceId = options.resourceId
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? config.tabularApiPageSize ?? 15
  const sort = options.sort
  let url = `${config.tabularApiUrl}/api/resources/${resourceId}/data/?page=${page}&page_size=${pageSize}`
  if (sort) {
    url += `&${sort.column}__sort=${sort.type}`
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
  return (id: string) => ofetch(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
