<template>
  <div class="flex items-center">
    <Toggletip
      class="-ml-3 mt-px"
      size="2xs"
    >
      {{ $t('Metadata quality:') }}
      <template #toggletip>
        <DatasetQualityTooltipContent :quality />
      </template>
    </Toggletip>
    <div class="text-sm text-gray-plain font-bold">
      {{ $t('Metadata quality:') }}
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
        :message="$t('Data description empty')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.resources_documentation"
        :message="$t('Files documentation missing')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.license"
        :message="$t('No license set')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.update_frequency && quality.update_fulfilled_in_time"
        :message="quality.update_frequency ? $t('Update frequency not followed') : $t('Update frequency not set')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.has_open_format"
        :message="$t('File formats are closed')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.temporal_coverage"
        :message="$t('Temporal coverage not set')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.spatial"
        :message="$t('Spatial coverage not set')"
      />
      <DatasetQualityItemWarning
        :quality-item="quality.all_resources_available"
        :message="$t('Some files are unavailable')"
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
