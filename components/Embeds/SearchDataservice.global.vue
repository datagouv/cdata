<template>
  <LoadingBlock
    v-slot="{ data: organization }"
    :status
    :data="organizationData"
    class="bg-transparent"
  >
    <div
      v-if="organization"
      ref="containerRef"
    >
      <h2 class="!text-sm !mb-2.5">
        {{ $t(`API de l'organisation`) }} {{ organization.name }}
      </h2>
      <GlobalSearch :config="getSearchConfig(organization.id)" />
    </div>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { GlobalSearch, LoadingBlock, type GlobalSearchConfig, type Organization } from '@datagouv/components-next'

const props = defineProps<{
  slug: string
}>()

const url = computed(() => `/api/1/organizations/${props.slug}/`)
const { data: organizationData, status } = await useAPI<Organization>(url, { lazy: true, server: false })

function getSearchConfig(organizationId: string): GlobalSearchConfig {
  return [
    {
      class: 'dataservices',
      hiddenFilters: [{ key: 'organization', value: organizationId }],
      basicFilters: ['is_restricted'],
    },
  ]
}
</script>
