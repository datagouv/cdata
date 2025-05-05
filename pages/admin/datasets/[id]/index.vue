<template>
  <AdminUpdateDatasetPage />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import AdminUpdateDatasetPage from '~/components/Datasets/AdminUpdateDatasetPage.vue'

defineProps<{
  dataset: DatasetV2
}>()
</script>
