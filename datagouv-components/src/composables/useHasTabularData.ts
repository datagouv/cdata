import { useComponentsConfig } from '../config'
import type { Resource } from '../types/resources'

export const useHasTabularData = () => {
  const config = useComponentsConfig()

  return {
    hasTabularData: (resource: Resource) => {
      return (
        config.tabularApiUrl
        && resource.extras['analysis:parsing:parsing_table']
        && !resource.extras['analysis:parsing:error']
        && (config.tabularAllowRemote || resource.filetype === 'file')
      )
    },
  }
}
