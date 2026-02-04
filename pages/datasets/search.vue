<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Recherche') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('Rechercher sur {site}', { site: config.public.title }) }}
    </h1>

    <GlobalSearch :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig, getDefaultDatasetConfig, getDefaultDataserviceConfig, getDefaultReuseConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const config = useRuntimeConfig()
const route = useRoute()
const { t } = useTranslation()

const robots = computed(() => {
  return Object.keys(route.query).length > 0 ? 'noindex, nofollow' : undefined
})

useSeoMeta({
  title: t('Recherche des jeux de données — data.gouv.fr'),
  robots,
})

const searchConfig: GlobalSearchConfig = [
  getDefaultDatasetConfig(),
  getDefaultDataserviceConfig(),
  getDefaultReuseConfig(),
]
</script>
