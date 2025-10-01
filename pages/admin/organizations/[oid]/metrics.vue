<template>
  <MetricsAdminPage :organization />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
}>()
</script>
