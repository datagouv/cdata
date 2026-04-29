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
    return (
      config.tabularApiUrl
      && resource.extras['analysis:parsing:parsing_table']
      && !resource.extras['analysis:parsing:error']
      && (config.tabularAllowRemote || resource.filetype === 'file')
    )
  }
}
