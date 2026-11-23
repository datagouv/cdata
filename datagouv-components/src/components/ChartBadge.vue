<template>
  <ObjectStatusBadge
    :status="getChartStatus(chart)"
    :size
  />
</template>

<script setup lang="ts">
import { getChartStatus } from '../functions/objectStatus'
import type { Chart } from '../types/visualizations'
import ObjectStatusBadge from './ObjectStatusBadge.vue'

defineProps<{
  chart: Chart
  size?: 'xs' | 'sm'
}>()
</script>
