<template>
  <div class="dg-quality-inline">
    <Toggletip
      button-class="dg-details-trigger dg-quality-trigger dg-quality-trigger-inline dg-quality-trigger-link"
      :button-props="{ title: t('Qualité des métadonnées') }"
    >
      <span class="dg-quality-trigger-label">
        <span>{{ t('Métadonnées') }}</span>
      </span>
      <QualityScore
        :score="quality.score"
        class="dg-card-quality-score"
      />
      <template #toggletip>
        <DataserviceQualityTooltipContent :quality />
      </template>
    </Toggletip>
  </div>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import type { DataserviceQuality } from '../types/dataservices'
import QualityScore from './QualityScore.vue'
import DataserviceQualityTooltipContent from './DataserviceQualityTooltipContent.vue'
import Toggletip from './CardDetailsPopover.vue'
import { useTranslation } from '../composables/useTranslation'

defineProps<{
  quality: DataserviceQuality
}>()

const { t } = useTranslation()
</script>
