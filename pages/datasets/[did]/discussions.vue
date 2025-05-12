<template>
  <DiscussionsList
    :subject="dataset"
    type="Dataset"
  />
</template>

<script setup lang="ts">
import type { DatasetV2 } from '@datagouv/components-next'
import DiscussionsList from '~/components/Discussions/DiscussionsList.vue'

defineProps<{ dataset: DatasetV2 }>()
</script>
