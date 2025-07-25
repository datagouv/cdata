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

    <h1 class="text-gray-title font-bold text-2xl mb-2">
      {{ $t('API') }}
    </h1>
    <p
      v-if="site"
      class="block mb-3"
    >
      {{ $t('Rechercher parmi {count} APIs sur {site}', {
        count: site.metrics.dataservices,
        site: config.public.title,
      }) }}
    </p>

    <DataservicesSearchPage />
  </div>
</template>

<script setup lang="ts">
import type { Site } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useI18n()
useSeoMeta({
  title: t('API'),
})

const config = useRuntimeConfig()

const { data: site } = await useAPI<Site>('/api/1/site')
</script>
