<template>
  <!-- Same display and behaviour for datasets and dataservices: the information icon and the
       label, then the full-width score. The missing items are listed only on request
       (`hide-warnings` false), the details being in the toggletip. -->
  <div class="grid gap-2">
    <Toggletip
      :styled-button="false"
      button-class="grid w-full gap-1.5 rounded-sm p-1.5 -m-1.5 border-transparent -outline-offset-2 text-left transition-colors hover:bg-gray-some"
      :button-props="{ title: t('Qualité des métadonnées') }"
    >
      <span class="flex items-center gap-1">
        <RiInformationLine
          class="size-4 shrink-0 text-gray-secondary"
          aria-hidden="true"
        />
        <span class="text-sm/5 font-normal text-gray-secondary">{{ t('Qualité des métadonnées') }}</span>
      </span>
      <QualityScore
        :score="quality.score"
        class="w-full"
      />
      <template #toggletip>
        <DatasetQualityTooltipContent :quality />
      </template>
    </Toggletip>
    <template v-if="!hideWarnings">
      <ul class="m-0 list-none space-y-1 p-0">
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
  </div>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
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
