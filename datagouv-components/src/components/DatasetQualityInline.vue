<template>
  <div class="m-0 text-sm text-gray-medium">
    <Toggletip
      :styled-button="false"
      button-class="border-transparent -outline-offset-2 inline-flex items-center justify-center hover:bg-gray-lower transition-colors"
      :button-props="{ class: 'relative z-2 gap-1 rounded-sm px-1 -mx-1 group/quality', title: t('Qualité des métadonnées') }"
    >
      <RiInformationLine class="size-3.5 shrink-0" />
      <span class="text-gray-medium text-sm group-hover/quality:underline">{{ t('Métadonnées :') }}</span>
      <DatasetQualityScore :score="quality.score" />
      <template #toggletip>
        <DatasetQualityTooltipContent :quality />
      </template>
    </Toggletip>
  </div>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import type { Quality } from '../types/datasets'
import DatasetQualityScore from './DatasetQualityScore.vue'
import DatasetQualityTooltipContent from './DatasetQualityTooltipContent.vue'
import Toggletip from './Toggletip.vue'
import { useTranslation } from '../composables/useTranslation'

defineProps<{
  quality: Quality
}>()

const { t } = useTranslation()
</script>
