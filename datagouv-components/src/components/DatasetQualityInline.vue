<template>
  <div class="m-0 flex flex-wrap items-center text-sm text-gray-medium">
    <div class="fr-grid-row fr-grid-row--middle">
      <Toggletip
        class="relative z-2"
        :teleport-id
      >
        <template #toggletip>
          <DatasetQualityTooltipContent :quality />
        </template>
      </Toggletip>
      <p class="my-0 mr-1 text-gray-medium text-sm">
        {{ $t('Métadonnées :') }}
      </p>
      <div class="fr-grid-row fr-grid-row--middle fr-mr-1v">
        <DatasetQualityScore :score="quality.score" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Quality } from '../types/datasets'
import DatasetQualityScore from './DatasetQualityScore.vue'
import DatasetQualityTooltipContent from './DatasetQualityTooltipContent.vue'
import Toggletip from './Toggletip.vue'

defineProps<{
  quality: Quality
  teleportId?: string
}>()
</script>
