<template>
  <div class="flex flex-col items-center py-12">
    <img
      :src="microscopeSrc"
      class="h-20 mb-3"
      alt=""
    >
    <p class="fr-text--bold mb-1">
      {{ t("Aucun aperçu disponible") }}
    </p>
    <p class="text-sm text-gray-medium mb-0 text-center max-w-lg">
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import microscopeSrc from '../../../assets/illustrations/microscope.svg?url'

const { t } = useTranslation()
</script>
