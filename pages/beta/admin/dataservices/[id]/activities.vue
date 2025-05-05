<template>
  <ActivityList :id="dataservice.id" />
</template>

<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  dataservice: Dataservice
}>()
</script>
