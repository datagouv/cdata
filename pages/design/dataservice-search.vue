<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Design System') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/dataservice-search">
        {{ $t('Dataservice Search') }}
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
