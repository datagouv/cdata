<template>
  <DatasetCard
    :dataset
    :style
    :show-description
    :dataset-url="dataset.page"
    :organization-url="dataset.organization?.page"
  />
</template>

<script setup lang="ts">
import { DatasetCard, type Dataset, type DatasetV2 } from '@datagouv/components-next'
import type { StyleValue } from 'vue'

withDefaults(defineProps<{
  dataset: Dataset | DatasetV2
  style?: StyleValue
  showDescription?: boolean
}>(), {
  showDescription: true,
})
</script>
