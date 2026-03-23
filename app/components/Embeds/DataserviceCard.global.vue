<template>
  <LoadingBlock
    v-slot="{ data }"
    :status
    :data="apiData"
    class="bg-transparent"
  >
    <DataservicesCard
      v-if="data"
      :dataservice="data"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import { LoadingBlock, type Dataservice } from '@datagouv/components-next'

const props = defineProps<{
  slug: string
}>()
const { data: apiData, status } = await useAPI<Dataservice>(`/api/1/dataservices/${props.slug}/`, { lazy: true, server: false })
</script>
