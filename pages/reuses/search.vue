<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Réutilisations') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('Réutilisations') }}
    </h1>

    <GlobalSearch :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('Réutilisations'),
})

const searchConfig: GlobalSearchConfig = [
  {
    class: 'reuses',
    basicFilters: ['organization'],
  },
  {
    class: 'datasets',
    basicFilters: ['organization', 'organization_badge'],
  },
  {
    class: 'dataservices',
    basicFilters: ['organization', 'is_restricted'],
  },
]
</script>
