<template>
  <ActivityList :id="reuse.id" />
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  reuse: Reuse
}>()
</script>
