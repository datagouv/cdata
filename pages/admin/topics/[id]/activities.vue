<template>
  <ActivityList :id="topic.id" />
</template>

<script setup lang="ts">
import type { Topic } from '@datagouv/components-next'

definePageMeta({
  requiredRole: 'admin',
})

defineProps<{
  topic: Topic
}>()
</script>
