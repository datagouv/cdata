import { inject, type Component, type InjectionKey } from 'vue'
import type { UseFetchFunction } from './functions/api.types'

export type PluginConfig = {
  name: string // Name of the application (ex: data.gouv.fr)
  baseUrl: string
  apiBase: string
  devApiKey?: string | null
  staticUrl: string
  datasetQualityGuideUrl?: string
  schemaValidataUrl: string
  schemaDocumentationUrl: string
  tabularApiUrl?: string
  tabularApiPageSize?: number
  tabularAllowRemote?: boolean
  tabularApiDataserviceId?: string
  customUseFetch?: UseFetchFunction | null
  textClamp?: string | Component | null
  appLink?: Component | null
  i18n?: {
    global: {
      mergeLocaleMessage: (locale: string, messages: unknown) => void
    }
  }
}

export const configKey = Symbol() as InjectionKey<PluginConfig>

export function useComponentsConfig(): PluginConfig {
  const config = inject(configKey)
  if (!config) throw new Error('Calling `useComponentsConfig` outside @datagouv/components')
  return config
}
