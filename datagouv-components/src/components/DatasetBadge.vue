<template>
  <ObjectStatusBadge
    :status="getDatasetStatus(dataset)"
    :size
  />
</template>

<script setup lang="ts">
import { getDatasetStatus } from '../functions/objectStatus'
import type { Dataset, DatasetV2, DatasetV2WithFullObject } from '../types/datasets'
import ObjectStatusBadge from './ObjectStatusBadge.vue'

defineProps<{
  dataset: Dataset | DatasetV2 | DatasetV2WithFullObject
  size?: 'xs' | 'sm'
}>()
</script>
