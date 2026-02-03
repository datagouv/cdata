<template>
  <div>
    <h2 class="!text-sm !mb-2.5">
      {{ $t(`API de l'organisation`) }}
    </h2>
    <GlobalSearch :config="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { GlobalSearch, type GlobalSearchConfig, type Organization, getDefaultDataserviceConfig } from '@datagouv/components-next'

const props = defineProps<{
  organization: Organization
}>()

const searchConfig: GlobalSearchConfig = [
  getDefaultDataserviceConfig({
    hiddenFilters: [{ key: 'organization', value: props.organization.id }],
    basicFilters: ['is_restricted'],
  }),
]
</script>
