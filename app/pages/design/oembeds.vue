<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/oembeds">
        {{ $t('Oembeds') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Oembeds
    </h1>

    <div data-udata-dataservice="api-sirene-open-data" />
    <div data-udata-dataset="base-adresse-nationale" />
    <div data-udata-reuse="geozones" />
    <div data-udata-organization="sante-publique-france" />
    <div
      data-udata-search-dataset="data-gouv-fr"
      data-height="1500"
      data-width="1200"
    />
    <div
      data-udata-search-dataservice="data-gouv-fr"
      data-height="1500"
      data-width="1200"
    />
    <div
      data-udata-list-reuse="data-gouv-fr"
      data-height="1500"
      data-width="1200"
    />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const siteConfig = useSiteConfig()

useHead({
  script: [
    {
      'data-udata': siteConfig.url,
      'src': '/oembed.js',
      'tagPosition': 'bodyClose',
    },
  ],
})
</script>
