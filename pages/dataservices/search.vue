<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        :external="true"
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('API') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('API') }}
    </h1>

    <GlobalSearch :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('API'),
})

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
