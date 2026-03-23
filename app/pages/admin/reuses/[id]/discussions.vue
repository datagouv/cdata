<template>
  <DiscussionsPage :subject="reuse" />
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'
import DiscussionsPage from '~/components/Discussions/DiscussionsPage.vue'

defineProps<{
  reuse: Reuse
}>()
</script>
