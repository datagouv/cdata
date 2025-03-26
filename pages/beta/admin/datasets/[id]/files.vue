<template>
  <AdminDatasetResourcesPage />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import AdminDatasetResourcesPage from '~/components/Datasets/AdminDatasetResourcesPage.vue'

defineProps<{
  dataset: DatasetV2
}>()
</script>
