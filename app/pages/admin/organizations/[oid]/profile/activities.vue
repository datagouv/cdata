<template>
  <ActivityList :id="organization.id" />
</template>

<script setup lang="ts">
import { ActivityList, type Organization } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  organization: Organization
}>()
</script>
