<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/dataservice-search">
        {{ $t('Recherche d\'APIs') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Dataservice Search
    </h1>

    <div class="bg-white py-4 px-4 -mx-4">
      <GlobalSearch :config="searchConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const searchConfig: GlobalSearchConfig = [
  {
    class: 'dataservices',
    basicFilters: ['organization', 'is_restricted'],
  },
  {
    class: 'datasets',
    basicFilters: ['organization', 'organization_badge'],
  },
  {
    class: 'reuses',
    basicFilters: ['organization'],
  },
]
</script>
