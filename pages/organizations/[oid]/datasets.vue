<template>
  <div>
    <h2 class="!text-sm !mb-2.5">
      {{ $t(`Jeux de données de l'organisation`) }}
    </h2>
    <GlobalSearch :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig, type Organization, getDefaultDatasetConfig } from '@datagouv/components-next'

const props = defineProps<{
  organization: Organization
}>()

const searchConfig: GlobalSearchConfig = [
  getDefaultDatasetConfig({
    hiddenFilters: [{ key: 'organization', value: props.organization.id }],
    basicFilters: ['tag', 'format', 'license', 'schema', 'geozone', 'granularity', 'badge'],
  }),
]
</script>
