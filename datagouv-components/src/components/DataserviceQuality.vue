<template>
  <Toggletip
    :styled-button="false"
    button-class="flex items-center gap-1 rounded-sm p-1.5 -m-1.5 border-transparent -outline-offset-2 hover:bg-gray-some transition-colors w-full text-left"
    :button-props="{ title: t('Qualité des métadonnées') }"
  >
    <DatasetQualityScore
      :score="quality.score"
      class="w-full"
    />
    <RiInformationLine
      class="size-5 shrink-0"
      aria-hidden="true"
    />
    <template #toggletip>
      <DataserviceQualityTooltipContent :quality />
    </template>
  </Toggletip>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import type { DataserviceQuality } from '../types/dataservices'
import DatasetQualityScore from './DatasetQualityScore.vue'
import DataserviceQualityTooltipContent from './DataserviceQualityTooltipContent.vue'
import Toggletip from './Toggletip.vue'
import { useTranslation } from '../composables/useTranslation'

defineProps<{
  quality: DataserviceQuality
}>()

const { t } = useTranslation()
</script>
