<template>
  <DiscussionsList
    :subject="topic"
    type="Topic"
  />
</template>

<script setup lang="ts">
import type { TopicV2 } from '@datagouv/components-next'

defineProps<{
  topic: TopicV2
}>()

useSeoMeta({ robots: 'noindex' })
</script>
