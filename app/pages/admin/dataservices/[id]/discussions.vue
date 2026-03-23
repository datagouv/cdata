<template>
  <DiscussionsPage :subject="dataservice" />
</template>

<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'
import DiscussionsPage from '~/components/Discussions/DiscussionsPage.vue'

defineProps<{
  dataservice: Dataservice
}>()
</script>
