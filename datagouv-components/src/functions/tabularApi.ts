import { ofetch } from 'ofetch'
import { useComponentsConfig, type PluginConfig } from '../config'
import type { SortConfig } from '../components/TabularExplorer/types'

export type { SortConfig }

/**
 * Call Tabular-api to get table content
 */
export async function getData(config: PluginConfig, id: string, page: number, sortConfig?: SortConfig | null) {
  let url = `${config.tabularApiUrl}/api/resources/${id}/data/?page=${page}&page_size=${config.tabularApiPageSize || 15}`
  if (sortConfig) {
    url = url + `&${sortConfig.column}__sort=${sortConfig.direction}`
  }
  return await ofetch(url)
}

/**
 * Call Tabular-api to get table profile
 */
export function useGetProfile() {
  const config = useComponentsConfig()
  return (id: string) => ofetch(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
