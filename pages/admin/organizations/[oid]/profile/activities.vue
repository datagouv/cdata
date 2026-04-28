<template>
  <ActivityList :id="organization.id" />
</template>

<script setup lang="ts">
import { ActivityList, type Organization } from '@datagouv/components-next'

definePageMeta({
  requiredPermission: 'edit',
})

defineProps<{
  organization: Organization
}>()
</script>
