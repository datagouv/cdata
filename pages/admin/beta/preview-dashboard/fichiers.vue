<template>
  <TabularExplorer
    v-model:filters="filters"
    :resource-id="config.public.tabularApiPreviewResourcesId"
  />
</template>

<script setup lang="ts">
import { TabularExplorer } from '@datagouv/components-next'
import type { ColumnFilters } from '@datagouv/components-next'
import { buildFiltersFromQuery } from '~/utils/previewDashboard'

const config = useRuntimeConfig()
const route = useRoute()

// The query only seeds the filters, the explorer owns them afterwards: pushing
// them back would remount the whole page, since /admin keys its NuxtPage on
// the full path, and every filter click would reset sort and visible columns.
const filters = ref<Record<string, ColumnFilters>>(buildFiltersFromQuery(route.query))
</script>
