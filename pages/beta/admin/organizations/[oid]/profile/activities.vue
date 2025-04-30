<template>
  <ActivityList :id="organization.id" />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  organization: Organization
}>()
</script>
