<template>
  <LoadingBlock
    v-slot="{ data: organization }"
    :data="organizationData"
    :status
    class="bg-transparent"
  >
    <div v-if="organization">
      <h2 class="!text-sm !mb-2.5">
        {{ $t(`Jeux de données de l'organisation`) }} {{ organization.name }}
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
      class: 'datasets',
      hiddenFilters: [{ key: 'organization', value: organizationId }],
      basicFilters: ['tag', 'format', 'license', 'schema', 'geozone', 'granularity', 'badge'],
    },
  ]
}
</script>
