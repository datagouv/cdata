<template>
  <ReuseCard
    :reuse
    :reuse-url="reuse.page"
    :organization-url="reuse.organization?.page"
  />
</template>

<script setup lang="ts">
import { ReuseCard, type Reuse } from '@datagouv/components-next'

defineProps<{
  reuse: Reuse
}>()
</script>
