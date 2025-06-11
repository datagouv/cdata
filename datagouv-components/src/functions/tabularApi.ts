import axios from 'axios'
import { useComponentsConfig, type PluginConfig } from '../config'

export type SortConfig = {
  column: string
  type: string
} | null

/**
 * Call Tabular-api to get table content
 */
export function getData(config: PluginConfig, id: string, page: number, sortConfig?: SortConfig) {
  let url = `${config.tabularApiUrl}/api/resources/${id}/data/?page=${page}&page_size=${config.tabularApiPageSize || 15}`
  if (sortConfig) {
    url = url + `&${sortConfig.column}__sort=${sortConfig.type}`
  }
  return axios.get(url)
}

/**
 * Call Tabular-api to get table profile
 */
export function getProfile(id: string) {
  const config = useComponentsConfig()

  return axios.get(`${config.tabularApiUrl}/api/resources/${id}/profile/`)
}
