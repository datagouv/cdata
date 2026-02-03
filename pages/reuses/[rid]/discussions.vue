<template>
  <DiscussionsList
    :subject="reuse"
    type="Reuse"
    :closed
  />
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'

const props = defineProps<{
  reuse: Reuse
}>()
const closed = computed(() => props.reuse.metrics.discussions - props.reuse.metrics.discussions_open)

useSeoMeta({ robots: 'noindex' })
</script>
