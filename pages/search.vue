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
        {{ $t('Recherche globale') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('Recherche globale') }}
    </h1>

    <GlobalSearch />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import GlobalSearch from '~/components/GlobalSearch.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('Recherche globale'),
  robots: 'noindex',
})
</script>
