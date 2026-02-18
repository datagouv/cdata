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
      {{ currentType === 'datasets' ? $t('Recherche avancée d\'un jeu de données') : currentType === 'dataservices' ? $t('Recherche avancée d\'une API') : $t('Recherche avancée d\'une réutilisation') }}
    </h1>

    <GlobalSearch
      v-model:type="currentType"
      :config="searchConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig, type SearchType, getDefaultDatasetConfig, getDefaultDataserviceConfig, getDefaultReuseConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

definePageMeta({
  key: 'search',
})

const config = useRuntimeConfig()
const route = useRoute()
const { t } = useTranslation()

function typeFromPath(path: string): SearchType {
  if (path.startsWith('/dataservices')) return 'dataservices'
  if (path.startsWith('/reuses')) return 'reuses'
  return 'datasets'
}

const currentType = computed<SearchType>({
  get: () => typeFromPath(route.path),
  set: (newType) => {
    navigateTo({ path: `/${newType}/search`, query: route.query })
  },
})

const robots = computed(() => {
  return Object.keys(route.query).length > 0 ? 'noindex, nofollow' : undefined
})

const title = computed(() => {
  switch (currentType.value) {
    case 'dataservices':
      return t('Moteur de recherche des API - {site}', { site: config.public.title })
    case 'reuses':
      return t('Moteur de recherche des réutilisations - {site}', { site: config.public.title })
    default:
      return t('Moteur de recherche des jeux de données - {site}', { site: config.public.title })
  }
})

const description = computed(() => {
  switch (currentType.value) {
    case 'dataservices':
      return t('Recherchez une API publique par mot-clé et filtrez les résultats grâce à plusieurs filtres.')
    case 'reuses':
      return t('Recherchez une réutilisation par mot-clé et filtrez les résultats grâce à plusieurs filtres.')
    default:
      return t('Recherchez un jeu de données par mot-clé et filtrez les résultats grâce à plusieurs filtres (organisation, licence, format, schéma, couverture, label…).')
  }
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  robots,
})

const searchConfig: GlobalSearchConfig = [
  getDefaultDatasetConfig(),
  getDefaultDataserviceConfig(),
  getDefaultReuseConfig(),
]
</script>
