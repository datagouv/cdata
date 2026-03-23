<template>
  <DiscussionsList
    :subject="dataservice"
    type="Dataservice"
    :closed
  />
</template>

<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'
import DiscussionsList from '~/components/Discussions/DiscussionsList.vue'

const props = defineProps<{ dataservice: Dataservice }>()
const closed = computed(() => props.dataservice.metrics.discussions - props.dataservice.metrics.discussions_open)

useSeoMeta({ robots: 'noindex' })
</script>
