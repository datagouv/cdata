<template>
  <LoadingBlock
    :status
    class="bg-transparent"
  >
    <DatasetCardLg
      v-if="data"
      :dataset="data"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import { LoadingBlock, type DatasetV2 } from '@datagouv/components-next'

const props = defineProps<{
  slug: string
}>()
const { data, status } = await useAPI<DatasetV2>(`/api/2/datasets/${props.slug}/`, { lazy: true, server: false })
</script>
