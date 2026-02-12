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

useSeoMeta({
  title: computed(() => ({
    datasets: t('Recherche des jeux de données'),
    dataservices: t('API'),
    reuses: t('Réutilisations'),
  })[currentType.value]),
  robots,
})

const searchConfig: GlobalSearchConfig = [
  getDefaultDatasetConfig(),
  getDefaultDataserviceConfig(),
  getDefaultReuseConfig(),
]
</script>
