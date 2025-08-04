<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
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
      data-udata-search-dataset="ministere-des-solidarites-et-de-la-sante"
      data-height="1500"
    />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const config = useRuntimeConfig()

useHead({
  script: [
    {
      'data-udata': config.public.frontBase,
      'src': '/oembed.js',
      'body': true,
    },
  ],
})
</script>
