<template>
  <MetricsAdminPage :organization />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

definePageMeta({
  keepScroll: true,
})

defineProps<{
  organization: Organization
}>()
</script>
