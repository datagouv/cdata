<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        :external="true"
      >
        {{ $t('Home') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Dataservices') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="!mb-2">
      {{ $t('Dataservices') }}
    </h1>
    <p
      v-if="site"
      class="block mb-3"
    >
      {{ $t('Search among {count} dataservices on {site}', {
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
  title: t('Dataservices'),
})

const config = useRuntimeConfig()

const { data: site } = await useAPI<Site>('/api/1/site')
</script>
