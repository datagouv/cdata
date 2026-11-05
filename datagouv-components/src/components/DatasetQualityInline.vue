<template>
  <ObjectCardQuality :score="quality.score">
    <DatasetQualityTooltipContent :quality />
  </ObjectCardQuality>
</template>

<script setup lang="ts">
import type { Quality } from '../types/datasets'
import DatasetQualityTooltipContent from './DatasetQualityTooltipContent.vue'
import ObjectCardQuality from './ObjectCardQuality.vue'

defineProps<{
  quality: Quality
}>()
</script>
