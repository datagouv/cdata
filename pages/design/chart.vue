<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/chart">
        {{ $t('Chart') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Chart Configurator
    </h1>

    <ChartConfigurator />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ChartConfigurator from '~/design-system/ChartConfigurator.vue'
</script>
