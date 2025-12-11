<template>
  <h5 class="text-sm text-gray-plain font-bold">
    {{ t("Qualité des métadonnées :") }}
  </h5>
  <ul class="list-none pl-0 space-y-2">
    <DatasetQualityItem
      :passed="quality.dataset_description_quality"
      :message-passed="t('Description des données renseignée')"
      :message-failed="t('Description des données non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.resources_documentation"
      :message-passed="t('Fichiers documentés')"
      :message-failed="t('Documentation des fichiers manquante')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.license"
      :message-passed="t('Licence renseignée')"
      :message-failed="t('Licence non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.update_frequency && !!quality.update_fulfilled_in_time"
      :message-passed="t('Fréquence de mise à jour respectée')"
      :message-failed="quality.update_frequency ? t('Fréquence de mise à jour non respectée') : t('Fréquence de mise à jour non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_open_format"
      :message-passed="t('Formats de fichiers standards')"
      :message-failed="t('Formats de fichiers non standards')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.temporal_coverage"
      :message-passed="t('Couverture temporelle renseignée')"
      :message-failed="t('Couverture temporelle non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.spatial"
      :message-passed="t('Couverture spatiale renseignée')"
      :message-failed="t('Couverture spatiale non renseignée')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.all_resources_available"
      :message-passed="t('Tous les fichiers sont disponibles')"
      :message-failed="t('Certains fichiers ne sont pas disponibles')"
      class="pb-0"
    />
  </ul>
  <div class="fr-grid-row fr-grid-row--right not-enlarged">
    <a
      :href="config.datasetQualityGuideUrl"
      target="_blank"
      rel="noopener"
      :title="t('En savoir plus sur cet indicateur - ouvre une nouvelle fenêtre')"
    >
      {{ t("En savoir plus sur cet indicateur") }}
    </a>
  </div>
</template>

<script setup lang="ts">
import type { Quality } from '../types/datasets'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityItem from './DatasetQualityItem.vue'

defineProps<{
  quality: Quality
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
</script>
