<template>
  <div id="tooltips" />
  <NuxtLoadingIndicator color="var(--blue-cumulus-main-526)" />
  <NuxtRouteAnnouncer />
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

const i18nHead = useLocaleHead()
const runtimeConfig = useRuntimeConfig()

app.vueApp.use(datagouv, {
  name: runtimeConfig.public.title,
  baseUrl: runtimeConfig.public.i18n.baseUrl, // Maybe do not use i18n config here?
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
    lang: i18nHead.value.htmlAttrs!.lang,
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - data.gouv.fr` : 'data.gouv.fr'
  },
})
</script>
