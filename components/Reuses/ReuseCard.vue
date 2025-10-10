<template>
  <ReuseCard
    :reuse
    :reuse-url="reuse.page"
    :organization-url="`/organizations/${reuse.organization?.slug}`"
  />
</template>

<script setup lang="ts">
import { ReuseCard, type Reuse } from '@datagouv/components-next'

defineProps<{
  reuse: Reuse
}>()
</script>
