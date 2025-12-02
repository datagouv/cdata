<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Jeux de données') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="text-gray-title font-extrabold text-2xl mb-2">
      {{ $t('Jeux de données') }}
    </h1>
    <p
      v-if="site"
      class="block mb-3"
    >
      {{ $t('Rechercher parmi les {count} jeux de données sur {site}', {
        count: site.metrics.datasets,
        site: config.public.title,
      }) }}
    </p>

    <DatasetsSearchPage />
  </div>
</template>

<script setup lang="ts">
import type { Site } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
useSeoMeta({
  title: t('Recherche des jeux de données — data.gouv.fr'),
})

const config = useRuntimeConfig()

const { data: site } = await useAPI<Site>('/api/1/site')
</script>
