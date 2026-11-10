<template>
  <div
    class="relative isolate size-full min-h-64 overflow-hidden bg-white"
    data-testid="chart-loader"
  >
    <GameOfLifeLoader class="absolute inset-0" />
    <p class="absolute inset-x-3 bottom-3 z-10 m-0 text-center text-xs leading-4 text-gray-medium">
      <span class="block font-medium text-new-gray-dark">{{ t('Préparation du graphique') }}</span>
      <span aria-hidden="true">{{ t('Mise en forme des données…') }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import GameOfLifeLoader from './GameOfLifeLoader.vue'
import { useTranslation } from '../../composables/useTranslation'

const { t } = useTranslation()
</script>
