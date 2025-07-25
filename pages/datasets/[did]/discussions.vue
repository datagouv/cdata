<template>
  <DiscussionsList
    :subject="dataset"
    type="Dataset"
    :closed
  />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import DiscussionsList from '~/components/Discussions/DiscussionsList.vue'

const props = defineProps<{ dataset: DatasetV2 }>()
const closed = computed(() => props.dataset.metrics.discussions - props.dataset.metrics.discussions_open)

useSeoMeta({ robots: 'noindex' })
</script>
