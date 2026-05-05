<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/dataset-search">
        {{ $t('Recherche de jeux de données') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Dataset Search
    </h1>

    <div class="bg-white py-4 px-4 -mx-4">
      <GlobalSearch :config="searchConfig">
        <template #custom-filters-bottom="{ currentType }">
          <ThemeTagFilter v-if="currentType === 'all-datasets' || currentType === 'inspire-datasets'" />
        </template>
      </GlobalSearch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ThemeTagFilter from '~/components/Design/ThemeTagFilter.vue'

const searchConfig: GlobalSearchConfig = [
  {
    class: 'datasets',
    key: 'all-datasets',
    name: 'Tous les jeux de données',
    placeholder: 'ex. budget de la ville de Paris',
    basicFilters: ['organization', 'organization_badge', 'tag', 'format', 'license', 'schema', 'geozone', 'granularity', 'badge'],
  },
  {
    class: 'datasets',
    key: 'inspire-datasets',
    name: 'Données INSPIRE',
    placeholder: null,
    hiddenFilters: [{ key: 'badge', value: 'inspire' }],
    basicFilters: ['organization', 'organization_badge', 'tag', 'format', 'license', 'schema', 'geozone', 'granularity'],
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
