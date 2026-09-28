<template>
  <div>
    <GlobalSearch
      v-model:type="searchType"
      :config="searchConfig"
      hide-search-input
    />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, getDefaultDatasetConfig, getDefaultDataserviceConfig, getDefaultReuseConfig } from '@datagouv/components-next'
import type { SearchType, GlobalSearchConfig, Organization } from '@datagouv/components-next'

const props = defineProps<{
  organization: Organization
}>()

const route = useRoute()
const searchType = ref<SearchType>((route.query.type as SearchType) || 'datasets')

const searchConfig: GlobalSearchConfig = [
  getDefaultDatasetConfig({
    hiddenFilters: [{ key: 'organization', value: props.organization.id }],
    basicFilters: ['tag', 'format', 'license', 'schema', 'geozone', 'granularity', 'badge'],
  }),
  getDefaultDataserviceConfig({
    hiddenFilters: [{ key: 'organization', value: props.organization.id }],
    basicFilters: ['is_restricted'],
  }),
  getDefaultReuseConfig({
    hiddenFilters: [{ key: 'organization', value: props.organization.id }],
    basicFilters: [],
  }),
]
</script>
