<template>
  <DiscussionsList
    :subject="dataservice"
    type="Dataservice"
  />
</template>

<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'
import DiscussionsList from '~/components/Discussions/DiscussionsList.vue'

defineProps<{ dataservice: Dataservice }>()
</script>
