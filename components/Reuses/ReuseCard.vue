<template>
  <ReuseCard
    :reuse
    :reuse-url="reuse.page"
    :organization-url="localePath(`/organizations/${reuse.organization?.slug}`)"
  />
</template>

<script setup lang="ts">
import { ReuseCard, type Reuse } from '@datagouv/components-next'

defineProps<{
  reuse: Reuse
}>()

const localePath = useLocalePath()
</script>
