<template>
  <ActivityList :id="reuse.id" />
</template>

<script setup lang="ts">
import { ActivityList, type Reuse } from '@datagouv/components-next'

defineProps<{
  reuse: Reuse
}>()
</script>
