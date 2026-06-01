import { datagouv } from '@datagouv/components-next'
import type { UseFetchFunction } from '@datagouv/components-next'
import CdataLink from '~/components/CdataLink.vue'
import { ClientOnly, TextClamp } from '#components'

// Install the @datagouv/components-next config ONCE, at app init. It used to be
// installed from both app.vue and error.vue, but `app.use(plugin)` is idempotent:
// landing on an error page first let error.vue install an INCOMPLETE config (no
// metricsApiUrl), and app.vue's later install was then a no-op. Navigating to a
// page using `useMetrics` afterwards threw "metricsApiUrl and apiBase must be
// configured". A plugin runs for both the normal and the error render, so there is
// a single, complete config.
export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const siteConfig = useSiteConfig()

  nuxtApp.vueApp.use(datagouv, {
    name: runtimeConfig.public.title,
    baseUrl: siteConfig.url,
    trustedDomains: runtimeConfig.public.trustedDomains,
    apiBase: runtimeConfig.public.apiBase,
    chartsApiBase: runtimeConfig.public.chartsApiBase,
    devApiKey: runtimeConfig.public.devApiKey,
    datasetQualityGuideUrl: runtimeConfig.public.datasetQualityGuideUrl,
    maxJsonPreviewCharSize: runtimeConfig.public.maxJsonPreviewCharSize,
    maxPdfPreviewByteSize: runtimeConfig.public.maxPdfPreviewByteSize,
    maxXmlPreviewCharSize: runtimeConfig.public.maxXmlPreviewCharSize,
    metricsApiUrl: runtimeConfig.public.metricsApi,
    pmtilesViewerBaseUrl: null,
    schemaValidataUrl: runtimeConfig.public.schemaValidataUrl,
    schemaDocumentationUrl: runtimeConfig.public.schemasSite.url,
    schemasSiteUrl: runtimeConfig.public.schemasSite.url,
    schemasSiteName: runtimeConfig.public.schemasSite.name,
    tabularApiUrl: runtimeConfig.public.tabularApiUrl,
    tabularApiDataserviceId: runtimeConfig.public.tabularApiDataserviceId,
    tabularAllowRemote: true,
    customUseFetch: useAPI as UseFetchFunction,
    textClamp: TextClamp,
    appLink: CdataLink,
    clientOnly: ClientOnly,
    forumUrl: runtimeConfig.public.forumUrl,
    searchDebounce: runtimeConfig.public.searchDebounce,
  })
})
