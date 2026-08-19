<template>
  <GeopfSyncPage />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import GeopfSyncPage from '~/components/Datasets/GeopfSyncPage.vue'

// Passed by the parent NuxtPage to every tab; unused here.
defineProps<{
  dataset: DatasetV2
}>()
</script>
