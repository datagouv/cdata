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
        v-if="quality"
        :score="quality.score"
        class="dg-card-quality-score"
      />
      <span
        v-else
        class="dg-quality-unavailable"
      >{{ t('Non disponible') }}</span>
      <template #toggletip>
        <DataserviceQualityTooltipContent
          v-if="quality"
          :quality
        />
        <p v-else>
          {{ t('La qualité des métadonnées n’est pas disponible pour cette API.') }}
        </p>
      </template>
    </Toggletip>
  </div>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import type { DataserviceQuality } from '../types/dataservices'
import QualityScore from './QualityScore.vue'
import DataserviceQualityTooltipContent from './CardDataserviceQualityTooltipContent.vue'
import Toggletip from './CardDetailsPopover.vue'
import { useTranslation } from '../composables/useTranslation'

defineProps<{
  quality?: DataserviceQuality | null
}>()

const { t } = useTranslation()
</script>
