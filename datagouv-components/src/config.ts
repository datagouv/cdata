import { inject, type Component, type InjectionKey } from 'vue'
import type { UseFetchFunction } from './functions/api.types'
import type { MatomoTracker } from './functions/matomo'
import type { $Fetch, FetchOptions } from 'ofetch'

export type PluginConfig = {
  name: string // Name of the application (ex: data.gouv.fr)
  baseUrl: string
  /** Hostnames allowed in Access-Control-Allow-Origin for resource preview CORS checks (e.g. data.gouv.fr). */
  trustedDomains?: string[]
  apiBase: string
  devApiKey?: string | null
  datasetQualityGuideUrl?: string
  maxJsonPreviewCharSize?: number // Maximum size of JSON to preview in characters. JSON preview module is partly collapsed by default so we can have a preview for large files.
  maxPdfPreviewByteSize?: number // Maximum size of PDF to preview in bytes
  maxImagePreviewByteSize?: number // Maximum size of image to preview in bytes
  maxXmlPreviewCharSize?: number // Maximum size of XML to preview in characters. XML preview module can NOT be collapsed by default so we should not have a preview for large files.
  pmtilesViewerBaseUrl?: string | null // Base URL of a pmtiles viewer (ex: https://pmtiles.io/#url=)
  metricsApiUrl?: string
  schemaValidataUrl?: string
  schemaDocumentationUrl?: string
  schemasSiteUrl?: string
  schemasSiteName?: string
  tabularApiUrl?: string
  chartsApiBase?: string
  tabularApiPageSize?: number
  tabularAllowRemote?: boolean
  tabularApiDataserviceId?: string
  customUseFetch?: UseFetchFunction | null
  /**
   * Imperative configured fetch (auth, headers, error handling): the single source of truth for
   * requests. The default `useFetch` uses it as its transport, and imperative helpers (metrics CSV
   * export, …) call it directly — so they never need a `?? ofetch` fallback.
   * Optional for consumers: when omitted, the plugin defaults it to an `ofetch` instance built from
   * the `onRequest`/`onResponse` hooks below (see the `datagouv` plugin install). A consumer can
   * instead provide its own (e.g. a Bearer-authenticated `$fetch`) and skip the hooks entirely.
   */
  $fetch?: $Fetch | null
  /** Auth/headers/error hooks. Folded into the default `$fetch` when no `$fetch` is provided. */
  onRequest?: FetchOptions['onRequest']
  onRequestError?: FetchOptions['onRequestError']
  onResponse?: FetchOptions['onResponse']
  onResponseError?: FetchOptions['onResponseError']
  textClamp?: string | Component | null
  appLink?: Component | null
  clientOnly?: Component | null
  searchDebounce?: number
  forumUrl?: string
  /**
   * Optional analytics tracker (e.g. Matomo), as a lazy factory so resolution
   * happens at call time, not at install time. When provided, components
   * report site searches and resource interactions through it, so hosts keep
   * control over noop/dryRun/debug semantics. Hosts without analytics omit it.
   */
  matomo?: () => MatomoHandle | undefined
}

/** Tracker surface the components actually use. */
export type MatomoHandle = Pick<MatomoTracker, 'trackEvent' | 'trackSiteSearch'>

// Populated by the plugin's install() from `PluginConfig.matomo`. Module-level
// (rather than injected) so imperative helpers in `functions/matomo` can reach
// it without a component context. Not re-exported from main.ts: internal.
let matomoResolver: PluginConfig['matomo']

export function setMatomoResolver(fn: PluginConfig['matomo']) {
  matomoResolver = fn
}

export function resolveMatomo(): MatomoHandle | undefined {
  return matomoResolver?.()
}

export const configKey = Symbol() as InjectionKey<PluginConfig>

// After the `datagouv` plugin install, `$fetch` is always set (defaulted to an ofetch instance), so
// consumers of the config can rely on it without a fallback.
export type ResolvedPluginConfig = PluginConfig & { $fetch: $Fetch }

export function useComponentsConfig(): ResolvedPluginConfig {
  const config = inject(configKey)
  if (!config) throw new Error('Calling `useComponentsConfig` outside @datagouv/components')
  return config as ResolvedPluginConfig
}
