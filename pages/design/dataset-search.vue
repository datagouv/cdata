<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Design System') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/dataset-search">
        {{ $t('Dataset Search') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Dataset Search
    </h1>

    <div class="bg-white py-4 px-4 -mx-4">
      <DatasetSearchPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DatasetSearchPage from '~/components/Datasets/SearchPage.vue'
</script>
