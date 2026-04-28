<template>
  <ActivityList :id="reuse.id" />
</template>

<script setup lang="ts">
import { ActivityList, type Reuse } from '@datagouv/components-next'

definePageMeta({
  requiredPermission: 'edit',
})

defineProps<{
  reuse: Reuse
}>()
</script>
