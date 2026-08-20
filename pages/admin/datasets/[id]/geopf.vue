<template>
  <GeopfSyncPage
    v-if="config.public.geopfEnabled"
    :dataset="dataset"
  />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import GeopfSyncPage from '~/components/Datasets/GeopfSyncPage.vue'

defineProps<{
  dataset: DatasetV2
}>()

const config = useRuntimeConfig()

if (!config.public.geopfEnabled) {
  showError({ statusCode: 404, statusMessage: 'Page Not Found' })
}
</script>
