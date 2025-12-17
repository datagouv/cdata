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

    <div class="flex justify-between items-start">
      <div>
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
      </div>
      <a
        href="/datasets/search.xml"
        class="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
        :title="$t('Flux RSS de cette recherche')"
        @click.prevent="openRss"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle
            cx="6.18"
            cy="17.82"
            r="2.18"
          />
          <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
        </svg>
        RSS
      </a>
    </div>

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

function openRss() {
  const searchParams = window.location.search
  const url = searchParams
    ? `/datasets/search.xml${searchParams}`
    : '/datasets/search.xml'
  window.open(url, '_blank')
}

const { data: site } = await useAPI<Site>('/api/1/site/')
</script>
