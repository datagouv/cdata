import { ofetch } from 'ofetch'
import { useComponentsConfig, type PluginConfig } from '../config'

export type SortConfig = {
  column: string
  type: string
} | null

/**
 * Call Tabular-api to get table content
 */
export async function getData(config: PluginConfig, id: string, page: number, sortConfig?: SortConfig) {
  let url = `${config.tabularApiUrl}/api/resources/${id}/data/?page=${page}&page_size=${config.tabularApiPageSize || 15}`
  if (sortConfig) {
    url = url + `&${sortConfig.column}__sort=${sortConfig.type}`
  }
  return await ofetch(url)
}

/**
 * Call Tabular-api to get table profile
 */
export async function getProfile(id: string) {
  const config = useComponentsConfig()

  return await ofetch(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
