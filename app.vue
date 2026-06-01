<template>
  <NuxtLoadingIndicator color="var(--blue-cumulus-main-526)" />
  <NuxtRouteAnnouncer />
  <Toaster
    position="bottom-right"
    :duration="4000"
    close-button
  />
  <div class="datagouv-components">
    <div
      id="tooltips"
      class="h-0"
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@datagouv/components-next'

const { locale } = useTranslation()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const siteConfig = useSiteConfig()

useHeadSafe({
  htmlAttrs: {
    lang: locale,
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - data.gouv.fr` : 'data.gouv.fr'
  },
})

useSeoMeta({
  description: runtimeConfig.public.description,
  ogTitle: runtimeConfig.public.title,
  ogDescription: runtimeConfig.public.description,
  ogType: 'website',
  ogUrl: () => `${siteConfig.url}${route.path}`,
  ogSiteName: runtimeConfig.public.title,
  ogLocale: 'fr_FR',
  twitterCard: 'summary_large_image',
  twitterSite: '@datagouvfr',
})
</script>
