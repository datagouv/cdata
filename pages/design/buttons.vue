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
    <h1 class="mb-1">
      Boutons
    </h1>
    <p class="text-gray-medium mb-10">
      Déclencher une action : soumettre un formulaire, ouvrir une modale, publier, supprimer.
    </p>

    <DSBrandedButtonDoc />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DSBrandedButtonDoc from '~/design-system/BrandedButtonDoc.vue'
</script>
