<template>
  <div />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

definePageMeta({
  middleware: to => navigateTo(`/organizations/${to.params.oid}/datasets`, { replace: true }),
})

defineProps<{
  organization: Organization
}>()
</script>
