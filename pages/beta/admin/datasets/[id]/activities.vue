<template>
  <ActivityList :id="dataset.id" />
</template>

<script setup lang="ts">
import type { Dataset } from '@datagouv/components-next'

defineProps<{
  dataset: Dataset
}>()
</script>
