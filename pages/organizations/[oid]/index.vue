<template>
  <div />
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'

defineProps<{
  organization: Organization
}>()

const route = useRoute()

await navigateTo(`/organizations/${route.params.oid}/datasets`, { replace: true })
</script>
