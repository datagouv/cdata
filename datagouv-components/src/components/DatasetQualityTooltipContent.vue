<template>
  <h5 class="text-sm text-gray-plain font-bold">
    {{ t("Metadata quality:") }}
  </h5>
  <ul class="list-none pl-0 space-y-2">
    <DatasetQualityItem
      :passed="quality.dataset_description_quality"
      :message-passed="t('Data description filled')"
      :message-failed="t('Data description empty')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.resources_documentation"
      :message-passed="t('Files documented')"
      :message-failed="t('Files documentation missing')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.license"
      :message-passed="t('License filled')"
      :message-failed="t('No license set')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.update_frequency && !!quality.update_fulfilled_in_time"
      :message-passed="t('Update frequency followed')"
      :message-failed="quality.update_frequency ? t('Update frequency not followed') : t('Update frequency not set')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.has_open_format"
      :message-passed="t('File formats are open')"
      :message-failed="t('File formats are closed')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.temporal_coverage"
      :message-passed="t('Temporal coverage filled')"
      :message-failed="t('Temporal coverage not set')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.spatial"
      :message-passed="t('Spatial coverage filled')"
      :message-failed="t('Spatial coverage not set')"
      class="pb-0"
    />
    <DatasetQualityItem
      :passed="quality.all_resources_available"
      :message-passed="t('All files are available')"
      :message-failed="t('Some files are unavailable')"
      class="pb-0"
    />
  </ul>
  <div class="fr-grid-row fr-grid-row--right not-enlarged">
    <a
      :href="config.datasetQualityGuideUrl"
      target="_blank"
      rel="noopener"
      :title="t('Learn more about this indicator - opens a new window')"
    >
      {{ t("Learn more about this indicator") }}
    </a>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Quality } from '../types/datasets'
import { useComponentsConfig } from '../config'
import DatasetQualityItem from './DatasetQualityItem.vue'

defineProps<{
  quality: Quality
}>()

const { t } = useI18n()
const config = useComponentsConfig()
</script>
