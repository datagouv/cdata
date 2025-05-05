<template>
  <ActivityList :id="dataset.id" />
</template>

<script setup lang="ts">
import type { Dataset } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  dataset: Dataset
}>()
</script>
