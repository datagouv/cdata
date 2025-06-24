<template>
  <div class="flex items-center">
    <Toggletip
      class="-ml-2 mt-px"
      size="2xs"
    >
      {{ $t('Qualité des métadonnées:') }}
      <template #toggletip>
        <DatasetQualityTooltipContent :quality />
      </template>
    </Toggletip>
    <div class="text-sm text-gray-plain font-bold">
      {{ $t('Qualité des métadonnées:') }}
    </div>
  </div>
  <DatasetQualityScore
    :score="quality.score"
    class="w-100"
  />
  <template v-if="showItemWarnings">
    <ul class="list-none pl-0">
      <DatasetQualityItemWarning
        :quality-item="quality.dataset_description_quality"
        :message="$t('Description des données non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.resources_documentation"
        :message="$t('Documentation des fichiers manquante')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.license"
        :message="$t('Licence non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.update_frequency && quality.update_fulfilled_in_time"
        :message="quality.update_frequency ? $t('Fréquence de mise à jour non respectée') : $t('Fréquence de mise à jour non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.has_open_format"
        :message="$t('Formats de fichiers non standards')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.temporal_coverage"
        :message="$t('Couverture temporelle non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.spatial"
        :message="$t('Couverture spatiale non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.all_resources_available"
        :message="$t('Certains fichiers ne sont pas disponibles')"
      />
    </ul>
  </template>
</template>

<script setup lang="ts">
import type { Quality } from '../types/datasets'
import DatasetQualityItemWarning from './DatasetQualityItemWarning.vue'
import DatasetQualityScore from './DatasetQualityScore.vue'
import Toggletip from './Toggletip.vue'
import DatasetQualityTooltipContent from './DatasetQualityTooltipContent.vue'

withDefaults(defineProps<{
  quality: Quality
  showItemWarnings?: boolean
}>(), {
  showItemWarnings: true,
})
</script>
