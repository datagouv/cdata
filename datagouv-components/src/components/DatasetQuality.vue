<template>
  <Toggletip
    :styled-button="false"
    button-class="flex flex-col gap-1 rounded-sm p-1.5 -m-1.5 border-transparent -outline-offset-2 hover:bg-gray-some transition-colors w-full text-left"
    :button-props="{ title: t('Qualité des métadonnées') }"
  >
    <span class="flex items-center gap-1">
      <RiInformationLine
        class="size-5 shrink-0"
        aria-hidden="true"
      />
      <span class="text-sm text-gray-plain font-bold">
        {{ t('Qualité des métadonnées:') }}
      </span>
    </span>
    <DatasetQualityScore
      :score="quality.score"
      class="w-full"
    />
    <template #toggletip>
      <DatasetQualityTooltipContent :quality />
    </template>
  </Toggletip>
  <template v-if="!hideWarnings">
    <ul class="list-none pl-0">
      <DatasetQualityItemWarning
        :quality-item="quality.dataset_description_quality"
        :message="t('Description des données non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.resources_documentation"
        :message="t('Documentation des fichiers manquante')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.license"
        :message="t('Licence non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.update_frequency && quality.update_fulfilled_in_time"
        :message="quality.update_frequency ? t('Fréquence de mise à jour non respectée') : t('Fréquence de mise à jour non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.has_open_format"
        :message="t('Formats de fichiers non standards')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.temporal_coverage"
        :message="t('Couverture temporelle non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.spatial"
        :message="t('Couverture spatiale non renseignée')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.all_resources_available"
        :message="t('Certains fichiers ne sont pas disponibles')"
      />
    </ul>
  </template>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import type { Quality } from '../types/datasets'
import DatasetQualityItemWarning from './DatasetQualityItemWarning.vue'
import DatasetQualityScore from './DatasetQualityScore.vue'
import Toggletip from './Toggletip.vue'
import DatasetQualityTooltipContent from './DatasetQualityTooltipContent.vue'
import { useTranslation } from '../composables/useTranslation'

withDefaults(defineProps<{
  quality: Quality
  hideWarnings?: boolean
}>(), {
  hideWarnings: true,
})

const { t } = useTranslation()
</script>
