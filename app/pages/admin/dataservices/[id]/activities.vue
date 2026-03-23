<template>
  <ActivityList :id="dataservice.id" />
</template>

<script setup lang="ts">
import { ActivityList } from '@datagouv/components-next'
import type { Dataservice } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  dataservice: Dataservice
}>()
</script>
