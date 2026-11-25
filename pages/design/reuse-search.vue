<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/reuse-search">
        {{ $t('Recherche de réutilisations') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Reuse Search
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
    class: 'reuses',
    basicFilters: ['organization', 'organization_badge', 'tag', 'type', 'topic'],
  },
]
</script>
