<template>
  <MetricsAdminPage :organization />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { keepScrollWithinPage } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollWithinPage,
})

defineProps<{
  organization: Organization
}>()
</script>
