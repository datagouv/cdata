<template>
  <section class="dg-quality-details">
    <p class="dg-quality-details-title">
      {{ t("Qualité des métadonnées :") }}
    </p>
    <ul class="dg-quality-criteria">
      <DatasetQualityItem
        :passed="quality.dataset_description_quality"
        :message-passed="t('Description des données renseignée')"
        :message-failed="t('Description des données non renseignée')"
      />
      <DatasetQualityItem
        :passed="quality.resources_documentation"
        :message-passed="t('Fichiers documentés')"
        :message-failed="t('Documentation des fichiers manquante')"
      />
      <DatasetQualityItem
        :passed="quality.license"
        :message-passed="t('Licence renseignée')"
        :message-failed="t('Licence non renseignée')"
      />
      <DatasetQualityItem
        :passed="quality.update_frequency && !!quality.update_fulfilled_in_time"
        :message-passed="t('Fréquence de mise à jour respectée')"
        :message-failed="quality.update_frequency ? t('Fréquence de mise à jour non respectée') : t('Fréquence de mise à jour non renseignée')"
      />
      <DatasetQualityItem
        :passed="quality.has_open_format"
        :message-passed="t('Formats de fichiers standards')"
        :message-failed="t('Formats de fichiers non standards')"
      />
      <DatasetQualityItem
        :passed="quality.temporal_coverage"
        :message-passed="t('Couverture temporelle renseignée')"
        :message-failed="t('Couverture temporelle non renseignée')"
      />
      <DatasetQualityItem
        :passed="quality.spatial"
        :message-passed="t('Couverture spatiale renseignée')"
        :message-failed="t('Couverture spatiale non renseignée')"
      />
      <DatasetQualityItem
        :passed="quality.all_resources_available"
        :message-passed="t('Tous les fichiers sont disponibles')"
        :message-failed="t('Certains fichiers ne sont pas disponibles')"
      />
    </ul>
    <div
      v-if="config.datasetQualityGuideUrl"
      class="dg-quality-guide"
    >
      <ProposalTextLink
        :to="config.datasetQualityGuideUrl"
        target="_blank"
        rel="noopener"
        :title="t('En savoir plus sur cet indicateur - ouvre une nouvelle fenêtre')"
      >
        {{ t("En savoir plus sur cet indicateur") }}
      </ProposalTextLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import ProposalTextLink from './AppLink.vue'
import '../../assets/cards.css'

import type { Quality } from '../types/datasets'
import { useComponentsConfig } from '../config'
import { useTranslation } from '../composables/useTranslation'
import DatasetQualityItem from './CardQualityItem.vue'

defineProps<{
  quality: Quality
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
</script>
