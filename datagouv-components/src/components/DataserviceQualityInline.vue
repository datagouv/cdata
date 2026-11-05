<template>
  <ObjectCardQuality :score="quality?.score ?? null">
    <DataserviceQualityTooltipContent
      v-if="quality"
      :quality
    />
    <p
      v-else
      class="m-0"
    >
      {{ t('La qualité des métadonnées n’est pas disponible pour cette API.') }}
    </p>
  </ObjectCardQuality>
</template>

<script setup lang="ts">
import type { DataserviceQuality } from '../types/dataservices'
import { useTranslation } from '../composables/useTranslation'
import DataserviceQualityTooltipContent from './DataserviceQualityTooltipContent.vue'
import ObjectCardQuality from './ObjectCardQuality.vue'

defineProps<{
  quality?: DataserviceQuality | null
}>()

const { t } = useTranslation()
</script>
