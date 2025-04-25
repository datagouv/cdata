<template>
  <DiscussionsList
    type="Reuse"
    :subject="reuse"
  />
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'

defineProps<{
  reuse: Reuse
}>()
</script>
