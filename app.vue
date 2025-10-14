<template>
  <NuxtLoadingIndicator color="var(--blue-cumulus-main-526)" />
  <NuxtRouteAnnouncer />
  <div
    id="tooltips"
    class="h-0"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { datagouv } from '@datagouv/components-next'
import type { UseFetchFunction } from '@datagouv/components-next'
import CdataLink from './components/CdataLink.vue'
import { ClientOnly, TextClamp } from '#components'

const app = useNuxtApp()

const { locale } = useTranslation()
const runtimeConfig = useRuntimeConfig()
const appConfig = useAppConfig()

if (appConfig.isFrenchGovernment) {
  import('./assets/css/fonts.css')
}
else {
  import('./assets/css/fonts-without-marianne.css')
}

app.vueApp.use(datagouv, {
  name: runtimeConfig.public.title,
  baseUrl: runtimeConfig.public.baseUrl,
  apiBase: runtimeConfig.public.apiBase,
  devApiKey: runtimeConfig.public.devApiKey,
  datasetQualityGuideUrl: runtimeConfig.public.datasetQualityGuideUrl,
  maxJsonPreviewCharSize: runtimeConfig.public.maxJsonPreviewCharSize,
  maxPdfPreviewByteSize: runtimeConfig.public.maxPdfPreviewByteSize,
  maxXmlPreviewCharSize: runtimeConfig.public.maxXmlPreviewCharSize,
  pmtilesViewerBaseUrl: null,
  schemaValidataUrl: runtimeConfig.public.schemaValidataUrl,
  schemaDocumentationUrl: runtimeConfig.public.schemasSite.url,
  tabularApiUrl: runtimeConfig.public.tabularApiUrl,
  tabularApiDataserviceId: runtimeConfig.public.tabularApiDataserviceId,
  tabularAllowRemote: true,
  customUseFetch: useAPI as UseFetchFunction, // Why this `as` is required?
  textClamp: TextClamp,
  appLink: CdataLink,
  clientOnly: ClientOnly,
})

useHeadSafe({
  htmlAttrs: {
    lang: locale,
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - data.gouv.fr` : 'data.gouv.fr'
  },
})
</script>
