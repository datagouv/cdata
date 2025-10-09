import { inject, type Component, type InjectionKey } from 'vue'
import type { UseFetchFunction } from './functions/api.types'

export type PluginConfig = {
  name: string // Name of the application (ex: data.gouv.fr)
  baseUrl: string
  apiBase: string
  devApiKey?: string | null
  staticUrl: string
  albertApiBaseUrl: string
  albertApiKey?: string
  datasetQualityGuideUrl?: string
  maxJsonPreviewCharSize?: number // Maximum size of JSON to preview in characters. JSON preview module is partly collapsed by default so we can have a preview for large files.
  maxPdfPreviewByteSize?: number // Maximum size of PDF to preview in bytes
  maxXmlPreviewCharSize?: number // Maximum size of XML to preview in characters. XML preview module can NOT be collapsed by default so we should not have a preview for large files.
  pmtilesViewerBaseUrl?: string | null // Base URL of a pmtiles viewer (ex: https://pmtiles.io/#url=)
  schemaValidataUrl?: string
  schemaDocumentationUrl?: string
  tabularApiUrl?: string
  tabularApiPageSize?: number
  tabularAllowRemote?: boolean
  tabularApiDataserviceId?: string
  customUseFetch?: UseFetchFunction | null
  textClamp?: string | Component | null
  appLink?: Component | null
  clientOnly?: Component | null
}

export const configKey = Symbol() as InjectionKey<PluginConfig>

export function useComponentsConfig(): PluginConfig {
  const config = inject(configKey)
  if (!config) throw new Error('Calling `useComponentsConfig` outside @datagouv/components')
  return config
}
