<template>
  <DiscussionsPage :subject="dataset" />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import DiscussionsPage from '~/components/Discussions/DiscussionsPage.vue'

defineProps<{
  dataset: DatasetV2
}>()
</script>
