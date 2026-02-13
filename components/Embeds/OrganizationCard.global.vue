<template>
  <LoadingBlock
    v-slot="{ data }"
    :status
    :data="apiData"
    class="bg-transparent overflow-hidden"
  >
    <OrganizationCard
      v-if="data"
      :organization="data"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import { LoadingBlock, OrganizationCard, type Organization } from '@datagouv/components-next'

const props = defineProps<{
  slug: string
}>()
const { data: apiData, status } = await useAPI<Organization>(`/api/1/organizations/${props.slug}/`, { lazy: true, server: false })
</script>
