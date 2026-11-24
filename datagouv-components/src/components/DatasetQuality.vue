<template>
  <Toggletip
    :styled-button="false"
    button-class="flex flex-wrap items-center gap-2 min-h-6 rounded-sm p-1.5 -m-1.5 border-transparent -outline-offset-2 hover:bg-gray-some transition-colors w-full text-left"
    :button-props="{ title: t('Qualité des métadonnées') }"
  >
    <span class="text-sm/5 font-normal text-gray-title">{{ t('Métadonnées') }}</span>
    <QualityScore
      :score="quality.score"
      compact
      class="translate-y-px"
    />
    <template #toggletip>
      <DatasetQualityTooltipContent :quality />
    </template>
  </Toggletip>
  <template v-if="!hideWarnings">
    <ul class="list-none pl-0">
      <QualityItemWarning
        :quality-item="quality.dataset_description_quality"
        :message="t('Description des données non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.resources_documentation"
        :message="t('Documentation des fichiers manquante')"
      />
      <QualityItemWarning
        :quality-item="quality.license"
        :message="t('Licence non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.update_frequency && quality.update_fulfilled_in_time"
        :message="quality.update_frequency ? t('Fréquence de mise à jour non respectée') : t('Fréquence de mise à jour non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.has_open_format"
        :message="t('Formats de fichiers non standards')"
      />
      <QualityItemWarning
        :quality-item="quality.temporal_coverage"
        :message="t('Couverture temporelle non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.spatial"
        :message="t('Couverture spatiale non renseignée')"
      />
      <QualityItemWarning
        :quality-item="quality.all_resources_available"
        :message="t('Certains fichiers ne sont pas disponibles')"
      />
    </ul>
  </template>
</template>

<script setup lang="ts">
import type { Quality } from '../types/datasets'
import QualityItemWarning from './QualityItemWarning.vue'
import QualityScore from './QualityScore.vue'
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
