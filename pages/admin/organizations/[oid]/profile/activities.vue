<template>
  <ActivityList :id="organization.id" />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import ActivityList from '~/components/ActivityList.vue'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  organization: Organization
}>()
</script>
