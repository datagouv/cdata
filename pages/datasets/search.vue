<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Jeux de données') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('Jeux de données') }}
    </h1>

    <GlobalSearch :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('Recherche des jeux de données — data.gouv.fr'),
})

const searchConfig: GlobalSearchConfig = [
  {
    class: 'datasets',
    basicFilters: ['organization', 'organization_badge', 'tag', 'format', 'license', 'schema', 'geozone', 'granularity', 'badge'],
  },
  {
    class: 'dataservices',
    basicFilters: ['organization', 'is_restricted'],
  },
  {
    class: 'reuses',
    basicFilters: ['organization'],
  },
]
</script>
