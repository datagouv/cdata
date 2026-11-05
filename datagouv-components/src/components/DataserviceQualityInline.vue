<template>
  <ObjectCardQuality :score="quality.score">
    <DataserviceQualityTooltipContent :quality />
  </ObjectCardQuality>
</template>

<script setup lang="ts">
import type { DataserviceQuality } from '../types/dataservices'
import DataserviceQualityTooltipContent from './DataserviceQualityTooltipContent.vue'
import ObjectCardQuality from './ObjectCardQuality.vue'

defineProps<{
  quality: DataserviceQuality
}>()
</script>
