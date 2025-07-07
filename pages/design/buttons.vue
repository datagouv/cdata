<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Design System') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/buttons">
        {{ $t('Buttons') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Buttons
    </h1>

    <DSBrandedButton />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DSBrandedButton from '~/design-system/BrandedButton.vue'
</script>
