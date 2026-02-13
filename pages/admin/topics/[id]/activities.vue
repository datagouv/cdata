<template>
  <ActivityList :id="topic.id" />
</template>

<script setup lang="ts">
import { ActivityList, type TopicV2 } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  topic: TopicV2
}>()
</script>
