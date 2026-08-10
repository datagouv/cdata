<template>
  <PreviewFormatStatsTable :resource-id="config.public.tabularApiPreviewStatsId" />
</template>

<script setup lang="ts">
import PreviewFormatStatsTable from '~/components/PreviewDashboard/PreviewFormatStatsTable.vue'

const config = useRuntimeConfig()
</script>
