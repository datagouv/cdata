<template>
  <NuxtLayout>
    <div class="fr-container fr-py-9v">
      <div class="prose">
        <template v-if="error && error.statusCode === 404">
          <h1>{{ $t('Error 404') }}</h1>
          <p>{{ $t("The page you're looking for cannot be found.") }}</p>
        </template>
        <template v-else>
          <h1>{{ $t('Erreur') }}</h1>
          <p>{{ $t('Something did not work as expected.') }}</p>

          <p v-if="error">
            <strong>{{ error.message }}</strong>
          </p>
        </template>
        <p>
          <a
            class="fr-link fr-reset-link"
            href="/"
          >
            {{ $t('Accueil') }}
          </a>
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { datagouv } from '@datagouv/components-next'
import type { UseFetchFunction } from '@datagouv/components-next'
import CdataLink from './components/CdataLink.vue'
import { TextClamp } from '#components'

const error = useError()

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
  tabularApiAllowRemote: true,
  datasetQualityGuideUrl: runtimeConfig.public.datasetQualityGuideUrl,
  customUseFetch: useAPI as UseFetchFunction, // Why this `as` is required?
  textClamp: TextClamp,
  appLink: CdataLink,
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
