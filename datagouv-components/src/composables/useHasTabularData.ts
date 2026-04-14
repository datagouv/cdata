import { useComponentsConfig } from '../config'

/**
 * Composable to determine if a resource has tabular data.
 * This is used to show the "Données" tab for tabular files AND the "Structure des données" tab (for tabular data structure).
 *
 * @returns An object containing the hasTabularData function.
 */
export const useHasTabularData = () => {
  const config = useComponentsConfig()

  return {
    hasTabularData: (resource: { extras: Record<string, unknown>, filetype?: string }) => {
      return (
        config.tabularApiUrl
        && resource.extras['analysis:parsing:parsing_table']
        && !resource.extras['analysis:parsing:error']
        && (config.tabularAllowRemote || resource.filetype === 'file')
      )
    },
  }
}
