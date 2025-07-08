<template>
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
import { TextClamp } from '#components'

const app = useNuxtApp()

const i18nHead = useLocaleHead()
const runtimeConfig = useRuntimeConfig()

app.vueApp.use(datagouv, {
  name: runtimeConfig.public.title,
  baseUrl: runtimeConfig.public.i18n.baseUrl, // Maybe do not use i18n config here?
  apiBase: runtimeConfig.public.apiBase,
  devApiKey: runtimeConfig.public.devApiKey,
  staticUrl: runtimeConfig.public.staticUrl,
  tabularApiUrl: runtimeConfig.public.tabularApiUrl,
  tabularAllowRemote: true,
  pmtilesViewerBaseUrl: null,
  datasetQualityGuideUrl: runtimeConfig.public.datasetQualityGuideUrl,
  customUseFetch: useAPI as UseFetchFunction, // Why this `as` is required?
  textClamp: TextClamp,
  appLink: CdataLink,
  maxJsonPreviewSize: 100000, // Maximum size of JSON to preview in characters (~100KB)
  maxPdfPreviewSize: 10000000, // Maximum size of PDF to preview in bytes (10 MB)
  maxXmlPreviewSize: 100000, // Maximum size of XML to preview in characters (~100KB)
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
