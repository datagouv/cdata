<template>
  <LoadingBlock
    :status
    class="bg-transparent"
  >
    <ReuseCard
      v-if="data"
      :reuse="data"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'
import ReuseCard from '~/components/Reuses/ReuseCard.vue'

const props = defineProps<{
  slug: string
}>()
const { data, status } = await useAPI<Reuse>(`/api/1/reuses/${props.slug}/`, { lazy: true, server: false })
</script>
