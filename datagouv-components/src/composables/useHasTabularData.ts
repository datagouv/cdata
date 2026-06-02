import { useComponentsConfig } from '../config'
import type { Resource } from '../types/resources'

/**
 * Composable to determine if a resource has tabular data.
 * This is used to show the "Données" tab for tabular files AND the "Structure des données" tab (for tabular data structure).
 *
 * @returns A function to check if a resource has tabular data.
 */
export const useHasTabularData = () => {
  const config = useComponentsConfig()

  return (resource: Resource) => {
    // Reject resources whose source URL last check failed (>= 400):
    // the tabular-api purges its parquet when the source dies, but
    // `parsing_table` may still be set — leading to a 404 on fetch.
    const checkStatus = resource.extras['check:status']
    const sourceUnreachable = typeof checkStatus === 'number' && checkStatus >= 400

    return (
      config.tabularApiUrl
      && resource.extras['analysis:parsing:parsing_table']
      && !resource.extras['analysis:parsing:error']
      && !sourceUnreachable
      && (config.tabularAllowRemote || resource.filetype === 'file')
    )
  }
}
