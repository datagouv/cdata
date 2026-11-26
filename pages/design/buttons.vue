<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/buttons">
        {{ $t('Buttons') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Buttons
    </h1>

    <DSBrandedButtonStates class="mb-12" />
    <DSSegmentedControl />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DSBrandedButtonStates from '~/design-system/BrandedButtonStates.vue'
import DSSegmentedControl from '~/design-system/SegmentedControl.vue'
</script>
