<template>
  <LoadingBlock
    :status
    class="bg-transparent"
  >
    <OrganizationCard
      v-if="data"
      :organization="data"
    />
  </LoadingBlock>
</template>

<script setup lang="ts">
import { OrganizationCard, type Organization } from '@datagouv/components-next'

const props = defineProps<{
  slug: string
}>()
const { data, status } = await useAPI<Organization>(`/api/1/organizations/${props.slug}/`, { lazy: true })
</script>
