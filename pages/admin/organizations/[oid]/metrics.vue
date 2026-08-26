<template>
  <MetricsAdminPage :organization />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { keepScrollBetweenTabs } from '~/utils/scroll'

definePageMeta({
  scrollToTop: keepScrollBetweenTabs,
})

defineProps<{
  organization: Organization
}>()
</script>
