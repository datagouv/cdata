<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/dataservice-search">
        {{ $t('Recherche d\'APIs') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Dataservice Search
    </h1>

    <div class="bg-white py-4 px-4 -mx-4">
      <DataservicesSearchPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
</script>
